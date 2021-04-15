# API Documentation

## Data types
### LevelInfo
Contains metadata about a level.
```typescript
{
	id: number,
	baseName: string,
	gameType: 'single' | 'multi',
	modification: 'gold' | 'platinum' | 'fubar' | 'ultra' | 'platinumquest',
	name: string,
	artist: string,
	desc: string,
	addedAt: number,
	gameMode: string,
	qualifyingTime: number,
	goldTime: number,
	platinumTime: number,
	ultimateTime: number,
	awesomeTime: number,
	gems: number,
	hasEasterEgg: boolean
}
```

## Level

### **GET** `/api/level/list`
Returns a list of all levels as an array of [LevelInfo](#levelinfo).

### **GET** `/api/level/{level-id}/zip`
Returns the .zip archive of the given level.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | 'none' \| 'gold' \| 'platinumquest' | *Optional, defaults to `'platinumquest'`.* If present, specifies the set of derfault assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.