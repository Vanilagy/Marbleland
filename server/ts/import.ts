import * as fs from 'fs-extra';
import * as path from 'path';
import { MisFile, MisParser, MissionElementSimGroup, MissionElementType } from './io/mis_parser';
import { Util } from './util';
import { Config } from './config';
import { db, keyValue } from './globals';
import { Mission, MissionDoc } from './mission';

/** Scans a given directory for missions and imports them all.
 * @param idMapPath Path to a JSON file which maps mission base names to IDs. Can be used for controlled setting of IDs.
 */
export const scanForMissions = async (baseDirectory: string, idMapPath?: string, replaceDuplicates = false, allowedRelativePaths?: Set<string>) => {
    let idMap: { id: number, baseName: string }[] = null;
    if (idMapPath) {
        idMap = JSON.parse(fs.readFileSync(idMapPath).toString());
        console.log("ID map loaded.");
    }

    console.log("Replace duplicate mode: On.");

    let success = 0;
    let failure = 0;
    let skipped = 0;
    let duplicates = 0;

    /** Recursively scans a directory. */
    const scan = async (relativePath: string) => {
        let entries = await fs.readdir(path.join(baseDirectory, relativePath));

        for (let entry of entries) {
            let joined = path.join(baseDirectory, relativePath, entry);
            let stat = await fs.stat(joined);
            let fromStart = path.posix.join(relativePath, entry);
	
            if (stat.isDirectory()) {
                await scan(fromStart); // Recurse
            } else {
                if (entry.toLowerCase().endsWith('.mis')) {
                    if (allowedRelativePaths && !allowedRelativePaths.has(fromStart)) continue;

                    // Check if the same file already exists in default PQ, and if so, skip it
                    let existsInPq = await fs.pathExists(path.join(Config.dataPath, relativePath, entry));
                    let isProbablyCustom = relativePath.includes('custom');
                    if (existsInPq && !isProbablyCustom) {
                        skipped++;
                        console.log("Skipping: ", fromStart);
                        continue;
                    }

                    console.log("Importing: ", fromStart);

                    let id: number;
                    if (idMap) {
                        // Find the ID in the map
                        let baseName = Util.getFileName(fromStart);
                        id = idMap.find(x => x.baseName === baseName)?.id;
                        if (id === undefined) throw new Error(`ID map is missing entry for baseName ${baseName}.`);
                        keyValue.set('levelId', Math.max(id, keyValue.get('levelId')));
                    }

                    let mission = new Mission(baseDirectory, fromStart, id);
	
                    try {
                        await mission.hydrate();
                    } catch (e) {
                        console.error(`Error in loading mission ${entry}:`, e);
                        failure++;
                        continue;
                    }

                    let duplicateDoc: MissionDoc;
                    if (replaceDuplicates) {
                        // Search for a duplicate level that was already added previously
                        let duplicatesArr = await db.missions.find({ $or: [
                            {
                                // Primitive heuristic, but should work to identify candidates
                                'info.name': mission.info.name,
                                'info.desc': mission.info.desc,
                                'info.artist': mission.info.artist,
                                'info.starthelptext': mission.info.starthelptext
                            },
                            {
                                misHash: mission.misHash
                            },
                            {
                                astHash: mission.astHash
                            }
                        ] }) as MissionDoc[];

                        for (let duplicate of duplicatesArr) {
                            if (duplicate.misHash !== mission.misHash) {
                                // We found a possible duplicate candidate.
                                let mis1 = new MisParser((await fs.readFile(path.join(duplicate.baseDirectory, duplicate.relativePath))).toString()).parse();
                                let mis2 = mission.mis;

                                // Compare the contents. If they don't match, it's (probably) not a duplicate.
                                if (!compareMissions(mis1, mis2)) continue;
                            }

                            console.log(`Duplicate found for ${path.join(relativePath, entry)} in ${path.join(duplicate.baseDirectory, duplicate.relativePath)}. Replacing the old entry.`);
                            duplicateDoc = duplicate;
                            duplicates++;

                            break;
                        }
                    }
					
                    // Add the mission to the database
                    let doc = mission.createDoc();
                    if (duplicateDoc) {
                        doc._id = duplicateDoc._id;
                        doc.addedAt = duplicateDoc.addedAt;
                        doc.addedBy = duplicateDoc.addedBy;
                        doc.downloads = duplicateDoc.downloads;
                        doc.remarks = duplicateDoc.remarks;
                        doc.lovedBy = duplicateDoc.lovedBy;
                        doc.editedAt = duplicateDoc.editedAt;

                        // We wrongly incremented the ID even though it got replaced now, so set it back so we don't inflate the ID for nothing.
                        let incrementedId = keyValue.get('levelId');
                        keyValue.set('levelId', incrementedId - 1);
                    }

                    await db.missions.update({ _id: doc._id }, doc, { upsert: true });
	
                    console.log("Level imported successfully with id " + doc._id);
                    success++;
                }
            }
        }
    };

    await scan('');
    console.log(
`================
Imported ${success + failure + skipped} level(s).
Successes: ${success}
Failures: ${failure}
Skipped: ${skipped}
Duplicates: ${duplicates}
    `);
};

/** Compares two missions and returns true, if their contents match (excluding MissionInfo). */
export const compareMissions = (mis1: MisFile, mis2: MisFile) => {
    let root1 = Util.jsonClone(mis1.root);
    let root2 = Util.jsonClone(mis2.root);

    const prepare = (simGroup: MissionElementSimGroup) => {
        for (let i = 0; i < simGroup.elements.length; i++) {
            let element = simGroup.elements[i];

            if (element._type === MissionElementType.SimGroup) {
                prepare(element);
            } else if (element._type === MissionElementType.ScriptObject && element._name === "MissionInfo") {
                simGroup.elements.splice(i--, 1);
            }
        }
    };
    prepare(root1);
    prepare(root2);

    return JSON.stringify(root1) === JSON.stringify(root2);
};

export const reimportMissions = async (levelIds: number[], allowCreation: boolean) => {
    let missions = await db.missions.find({}) as MissionDoc[];
    if (levelIds.length > 0) missions = missions.filter(x => levelIds.includes(x._id));
    let baseDirectories = new Set(missions.map(x => x.baseDirectory));

    let relativePaths = allowCreation? null : new Set(missions.map(x => x.relativePath));

    console.log("Reimporting missions...");
    if (levelIds.length > 0) console.log(`Reimporting only level IDs ${levelIds.join(', ')}`);

    for (let directory of baseDirectories) {
        console.log(`Now re-scanning: ${directory}\n\n`);
        await scanForMissions(directory, null, true, relativePaths);
    }

    console.log("Reimport complete.");
};