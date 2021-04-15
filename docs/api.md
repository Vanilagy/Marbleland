# API Documentation

## Authentication
Some API calls require the user to be authenticated to perform them. Authentication works by setting the `Authorization` header with a value of `"Bearer <your-token>"`, so for example `"Bearer JBajPPAt+w/2tshyPSWNskWs054Zl2tFuPIzmcq7+WI="`. A token can be acquired through sign-in and sign-up.

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

### ExtendedLevelInfo
Contains metadata about a level, as well as additional data to display on the Level page.
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
	hasEasterEgg: boolean,
	addedBy: ProfileInfo,
	remarks: string,
	packs: PackInfo[],
	comments: CommentInfo[],
	downloads: number
}
```

### PackInfo
Contains metadata about a pack.
```typescript
{
	id: number,
	name: string,
	createdBy: ProfileInfo,
	createdAt: number,
	levelIds: number[]
}
```

## Level

### **GET** `/api/level/list`
Returns a list of all levels as an array of [LevelInfo](#levelinfo).

### **GET** `/api/level/{level-id}/zip`
Get the .zip archive for the given level.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of derfault assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.

### **GET** `/api/level/{level-id}/image`
Get the image thumbnail for the given level.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
original | `boolean` | If set, the original, uncompressed image thumbnail will be returned. Takes precedence over `width` and `height`.
width | `number` | When used together with `height`, specifies the dimensions to resize the image to. The original image will be stretched to cover the new dimensions while maintaining its aspect ratio.
height | `number` | *See `width`.*

### **GET** `/api/level/{level-id}/dependencies`
Returns a list of files (assets) the given level depends on as an array of `string`. Essentially returns the file paths of the .zip.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of derfault assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.

### `GET` **/api/level/{level-id}/info**
Returns the metadata for the given level in the form of [LevelInfo](#levelinfo).

### `GET` **/api/level/{level-id}/extended-info**
Returns the extended information for the given level in the form of [ExtendedLevelInfo](#extendedlevelinfo).

### **GET** `/api/level/{level-id}/mission-info`
Returns the raw MissionData ScriptObject of the .mis file as a `Record<string, string | string[]>`.

### **GET** `/api/level/{level-id}/packs`
Returns a list of packs the given level appears in as an array of [PackInfo](#packinfo).
### **POST** `/api/level/upload`
**Requires [authentication](#authentication).** Uploads a .zip archive containing a level and primes it for submission.

**Request body:** The raw data of the .zip file with `Content-Type: application/zip`.

**Response body:**
```typescript
{
	status: 'error',
	problems: string[] // A list of problems with the uploaded archive
} | {
	status: 'success',
	uploadId: number, // The random ID of this upload. Needs to be remembered for submission.
	warnings: string[] // A list of warnings about the uploaded archive
}
```

### **POST** `/api/level/submit`
**Requires [authentication](#authentication).** Submits a previously uploaded level, that is, adds it to the database and makes it accessible.

**Request body (`Content-Type: application/json`):**
```typescript
{
	uploadId: number
}
```

**Response body:**
```typescript
{
	levelId: number // The ID of the submitted level
}
```