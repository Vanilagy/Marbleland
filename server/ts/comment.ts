import { CommentInfo } from "../../shared/types";
import { AccountDoc, getProfileInfo } from "./account";
import { db } from "./globals";

/** The representation of a comment in the database. */
export interface CommentDoc {
	_id: number,
	for: number,
	/** The type of content this comment is for. Currently still level, but might expand to packs if needed. */
	forType: 'level',
	author: number,
	time: number,
	content: string
}

/** Generates the comment info for a given comment. */
export const getCommentInfo = async (doc: CommentDoc): Promise<CommentInfo> => {
	let authorDoc = await db.accounts.findOne({ _id: doc.author }) as AccountDoc;

	return {
		id: doc._id,
		author: await getProfileInfo(authorDoc),
		time: doc.time,
		content: doc.content
	};
};

/** Generates the comment infos for all comments in a given level. */
export const getCommentInfosForLevel = async (levelId: number) => {
	let commentDocs = await db.comments.find({ forType: 'level', for: levelId }) as CommentDoc[];
	commentDocs.sort((a, b) => b.time - a.time);
	let commentInfos: CommentInfo[] = [];
	for (let commentDoc of commentDocs) {
		commentInfos.push(await getCommentInfo(commentDoc));
	}

	return commentInfos;
};