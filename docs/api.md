# API Documentation

All of Marbleland's functionality can be accessed programatically through an API which is documented here. A few notes on the format: If in JSON form, response and request body types are specified using the **TypeScript type syntax**. All query parameters not marked with an * are optional.

- [Authentication](#authentication)
- [API endpoints](#api-endpoints)
	- [Level](#level)
	- [Comment](#comment)
	- [Account](#account)
	- [Pack](#pack)
	- [Home](#home)
- [Defining playable games and leaderboard sources](#defining-playable-games-and-leaderboard-sources)
- [Data types](#data-types)
- [MBPak Support](#mbpak-support)

# Authentication
Some API calls require the user to be authenticated to perform them.

Authentication works by setting the `Authorization` header with a value of `Bearer <your-token>`, so for example `Bearer JBajPPAt+w/2tshyPSWNskWs054Zl2tFuPIzmcq7+WI=`. Alternatively, you can send a cookie called `token` with `<your-token>` as its value.

A token can be acquired through sign-in and sign-up.

# API endpoints
## Level

### `GET` /api/level/list
Returns a list of all levels as an array of [LevelInfo](#levelinfo).

### `POST` /api/level/zip
Get a .zip archive containing all the levels specified in the request.

**Form parameters (`Content-Type: application/x-www-form-urlencoded`):**

Name | Type | Meaning
--- | --- | ---
ids | `string` | A comma-separated list of level IDs to include in the .zip.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of default assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.
append-id-to-mis | `boolean` | If present, each level's ID will be appended to the end of its corresponding .mis file.

### `GET` /api/level/{level-id}/zip
Get the .zip archive for a given level.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of default assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.
append-id-to-mis | `boolean` | If present, each level's ID will be appended to the end of its corresponding .mis file.

### `GET` /api/level/{level-id}/mbpak
Get the .mbpak archive for a given level.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of default assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.
append-id-to-mis | `boolean` | If present, each level's ID will be appended to the end of its corresponding .mis file.

### `GET` /api/level/{level-id}/image
Get the image thumbnail for a given level.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
original | `boolean` | If set, the original, uncompressed image thumbnail will be returned. Takes precedence over `width` and `height`.
width | `number` | When used together with `height`, specifies the dimensions to resize the image to. The original image will be stretched to cover the new dimensions while maintaining its aspect ratio.
height | `number` | *See `width`.*

### `GET` /api/level/{level-id}/prev-image
Get the (usually large) preview image for a given level. Note that not every level has one.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
original | `boolean` | If set, the original, uncompressed preview image will be returned. Takes precedence over `width` and `height`.
width | `number` | When used together with `height`, specifies the dimensions to resize the image to. The original image will be stretched to cover the new dimensions while maintaining its aspect ratio.
height | `number` | *See `width`.*

### `GET` /api/level/{level-id}/dependencies
Returns a list of files (assets) a given level depends on as an array of `string`. Essentially returns the file paths of the .zip.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of default assets to exclude from the dependencies. For example, if set to `'gold'`, all MBG default assets won't be listed as a dependency.
append-id-to-mis | `boolean` | If present, each level's ID will be appended to the end of its corresponding .mis file.

### `GET` /api/level/{level-id}/info
Returns the metadata for a given level in the form of [LevelInfo](#levelinfo).

### `GET` /api/level/{level-id}/extended-info
Returns the extended information for a given level in the form of [ExtendedLevelInfo](#extendedlevelinfo).

### `GET` /api/level/{level-id}/mission-info
Returns the raw MissionData ScriptObject of the .mis file as a `Record<string, string | string[]>`.

### `GET` /api/level/{level-id}/packs
Returns a list of packs a given level appears in as an array of [PackInfo](#packinfo).

### `GET` /api/level/{level-id}/leaderboards/{leaderboards-id}
Returns the specified leaderboards for the given level in sorted order.

**Response body:**
```typescript
{
	scores: {
		username: string,
		score: number,
		score_type: 'time' | 'score',
		placement: number
	}[]
}
```

### `POST` /api/level/upload
**Requires [authentication](#authentication).** Uploads a .zip archive containing a level and primes it for submission. Note that uploading through the API implies you have read and agreed to the Marbleland content guidelines.

**Request body:** The raw data of the .zip file with `Content-Type: application/zip`.

**Response body:**
```typescript
{
	// On error
	status: 'error',
	problems: string[] // A list of problems with the uploaded archive
} | {
	// On successful upload
	status: 'success',
	uploadId: string, // The random ID of this upload. Needs to be remembered for submission.
	missions: { // List of missions detected in the .zip.
		misFilePath: string,
		name: string
	}[],
	packs: PackInfo[], // The packs of the uploader. These are needed for displaying them during the upload process.
	warnings: string[] // A list of warnings about the uploaded archive
}
```

### `GET` /api/level/upload-image
**Requires [authentication](#authentication).** For a given mission upload process, gets the image thumbnail for one of the uploaded missions.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
uploadId* | `string` | The ID of the ongoing upload.
missionId* | `number` | The index of the mission whose image thumbnail should be retrieved.

### `POST` /api/level/submit
**Requires [authentication](#authentication).** Submits a previously uploaded level, that is, adds it to the database and makes it accessible.

**Request body (`Content-Type: application/json`):**
```typescript
{
	uploadId: string,
	remarks: string[], // Additional remarks for each uploaded level to display on that level's page
	addToPacks: number[], // The IDs of the packs that all uploaded levels should be added to
	newPack?: { // Info about a brand new pack that will be created and that the new levels will be added to immediately
		name: string,
		description: string
	}
}
```

**Response body:**
```typescript
{
	levelIds: number, // The IDs of the submitted levels
	newPackId?: number // Should a new pack have been created, this will be the ID for that pack
}
```

### `PATCH` /api/level/{level-id}/edit
**Requires [authentication](#authentication).** Edit the metadata of a previously submitted level. Right now, the level's MissionInfo and remarks can be edited.

**Request body (`Content-Type: application/json`):**
```typescript
{
	missionInfo: Record<string, string> | null, // The new MissionInfo fields. Only certain fields are allowed to be changed, check shared/constants.ts.
	remarks: string | null
}
```

**Response body:**
The extended information for the given level in the form of [ExtendedLevelInfo](#extendedlevelinfo) after it was edited.

### `DELETE` /api/level/{level-id}/delete
**Requires [authentication](#authentication).** Deletes a previously submitted level from the database.

### `POST` /api/level/{level-id}/comment
**Requires [authentication](#authentication).** Adds a comment to given level. Returns the full list of comments (after submission) for a given level in the form of an array of [CommentInfo](#commentinfo).

**Request body (`Content-Type: application/json`):**
```typescript
{
	content: string // The content of the comment
}
```

### `PATCH` /api/level/{level-id}/love
**Requires [authentication](#authentication).** Marks a level as loved.

### `PATCH` /api/level/{level-id}/unlove
**Requires [authentication](#authentication).** Unmarks a level as loved.

## Comment
### `DELETE` /api/comment/{comment-id}
**Requires [authentication](#authentication).** Deletes a previously written comment. Returns the full list of comments (after deletion) for the comment's level in the form of an array of [CommentInfo](#commentinfo).

## Account
### `POST` /api/account/sign-up
Registers a new account.

**Request body (`Content-Type: application/json`):**
```typescript
{
	email: string,
	username: string,
	password: string
}
```

**Response body:**
```typescript
{
	// On error
	status: 'error',
	reason: string
} | {
	// On successful account creation
	status: 'success',
	token: string,
	signInInfo: SignInInfo
}
```

### `POST` /api/account/sign-in
Sign in to an existing account.

**Request body (`Content-Type: application/json`):**
```typescript
{
	emailOrUsername: string,
	password: string
}
```

**Response body:**
```typescript
{
	// On error
	status: 'error',
	reason: string
} | {
	// On successful sign-in
	status: 'success',
	token: string,
	signInInfo: SignInInfo
}
```

### `POST` /api/account/sign-out
**Requires [authentication](#authentication).** Signs out a previously signed-in account by invalidating its token.

### `POST` /api/account/check-token
**Requires [authentication](#authentication).** Checks the validity of a token specified in the Authorization header. If it is valid, returns [SignInInfo](#signininfo) for the corresponding account.

### `GET` /api/account/{account-id}/info
Returns extended metadata about a given account in form of [ExtendedProfileInfo](#extendedprofileinfo).

### `GET` /api/account/{account-id}/avatar
Get the avatar image for a given account. Note that this will return a default image if the account hasn't set an avatar yet, and in that case the `size` query param won't do anything.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
size | `number` | If set, resizes the avatar image to a square with side lengths of `size`.

### `POST` /api/account/{account-id}/set-avatar
**Requires [authentication](#authentication).** Sets the avatar image for a given account.

**Request body:** The raw data of avatar image file with `Content-Type: image/*`.

### `POST` /api/account/{account-id}/set-bio
**Requires [authentication](#authentication).** Sets the biography for a given account.

**Request body:** The new biography as a `string` with `Content-Type: text/plain`.

### `POST` /api/account/change-password
**Requires [authentication](#authentication).** Changes the password of the authenticated account.

**Request body (`Content-Type: application/json`):**
```typescript
{
    currentPassword: string,
    newPassword: string
}
```

### `POST` /api/account/acknowledge-guidelines
**Requires [authentication](#authentication).** Acknowledges the upload content guidelines for the authenticated account.

## Pack
### `GET` /api/pack/list
Returns a list of all packs as an array of [PackInfo](#packinfo).

### `GET` /api/pack/{pack-id}/info
Returns extended metadata about a pack in the form of [ExtendedPackInfo](#extendedpackinfo)

### `GET` /api/pack/{pack-id}/zip
Get the .zip archive for a given pack, containing all levels the pack contains.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of default assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.

### `GET` /api/pack/{pack-id}/image
Get the image thumbnail of a given pack.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
original | `boolean` | If set, the original, uncompressed image thumbnail will be returned. Takes precedence over `width` and `height`.
width | `number` | When used together with `height`, specifies the dimensions to resize the image to. The original image will be stretched to cover the new dimensions while maintaining its aspect ratio.
height | `number` | *See `width`.*

### `POST` /api/pack/create
**Requires [authentication](#authentication).** Creates a new, empty level pack.

**Request body (`Content-Type: application/json`):**
```typescript
{
	name: string,
	description: string
}
```

**Response body:**
```typescript
{
	packId: number // The ID of the just created pack
}
```

### `POST` /api/pack/{pack-id}/set-levels
**Requires [authentication](#authentication).** Sets the list of levels included in a given pack.

**Request body (`Content-Type: application/json`):**
```typescript
number[] // An array of level IDs to include in the pack
```

### `PATCH` /api/pack/{pack-id}/edit
**Requires [authentication](#authentication).** Edits the metadata of a given pack.

**Request body (`Content-Type: application/json`):**
```typescript
{
	name: string,
	description: string
}
```

### `DELETE` /api/pack/{pack-id}/delete
**Requires [authentication](#authentication).** Edits a given pack from the database.

### `PATCH` /api/pack/{pack-id}/love
**Requires [authentication](#authentication).** Marks a pack as loved.

### `PATCH` /api/pack/{pack-id}/unlove
**Requires [authentication](#authentication).** Unmarks a pack as loved.

## Home
### `GET` /api/home/info
Returns the necessary data for the Home page in the form of [HomeInfo](#homeinfo).

# Defining playable games and leaderboard sources
Marbleland supports the ability to launch the game directly into the level of your choice by the use of the Play button. It also provides a view of the leaderboards available for the level.
They are defined in the `server/data/config.json` file having the structure.
```typescript
{
	games: GameDefinition[],
	leaderboardSources: LeaderboardDefinition[]
}
```

The `queryUrl` of the leaderboard definition contains the endpoint of the leaderboards which should be queried by the server to fetch the scores.
The response of the server should be in the format of:
```typescript
{
	scores: {
		username: string,
		score: number,
		score_type: 'time' | 'score',
		placement: number
	}[]
}
```

Example configuration values:
```json
    "games": [
        {
            "id": "webport",
            "name": "Webport",
            "playUrl": "https://marbleblast.vaniverse.io/?play={id}",
            "datablockCompatibility": "mbw"
        }
    ],
    "leaderboardSources": [
        {
            "id": "marbleblast",
            "name": "marbleblast.com",
            "queryUrl": "https://marbleblast.com/pq/leader/api/Score/GetMarblelandScoresApi.php?missionId={id}",
            "datablockCompatibility": "pq"
        }
    ]
```

# Data types
The following describes a set of object data types used in the API.
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
	editedAt: number, // Timestamp of when the level was last edited, null if it hasn't been edited.

	qualifyingTime: number,
	goldTime: number,
	platinumTime: number,
	ultimateTime: number,
	awesomeTime: number,

	qualifyingScore: number,
	goldScore: number,
	platinumScore: number,
	ultimateScore: number,
	awesomeScore: number,

	gems: number,
	hasEasterEgg: boolean,

	downloads: number,
	lovedCount: number,

	hasCustomCode: boolean,
	datablockCompatibility: 'mbg' | 'mbw' | 'pq' // Which variant of Marble Blast this level's datablocks are compatible with
}
```

### ExtendedLevelInfo
Contains metadata about a level, as well as additional data to display on the Level page.
```typescript
LevelInfo & {
	addedBy: ProfileInfo,
	remarks: string,
	packs: PackInfo[],
	comments: CommentInfo[],
	downloads: number,
	missesDependencies: boolean,
	lovedByYou: boolean, // Indicates if the logged-in user has loved the level
	hasPrevImage: boolean,
	missionInfo: Record<string, string>, // All the properties of the .mis file's MissionInfo element
	dependencies: string[], // The list of files (assets) the given level depends on
	playInfo: GameDefinition[], // Contains the definitions of the games the level can be played on
	leaderboardInfo: LeaderboardDefinition[] // Contains the definitions of the leaderboards available for the level
}
```

### GameDefinition
Contains the definition of a game the level can be played on
```typescript
{
	id: string,
	name: string,
	datablockCompatibility: 'mbg' | 'mbw' | 'pq', // The minimum datablock compatibility required by the level to be playable in the game
	playUrl: string, // The direct link to play the level in the defined game
}
```

### LeaderboardDefinition
Contains the definition of a leaderboard source for levels.
```typescript
{
	id: string,
	name: string,
	datablockCompatibility: 'mbg' | 'mbw' | 'pq', // The minimum datablock compatibility required by the level to be playable in the game
	queryUrl: string, // The leaderboard endpoint that can be used to query the leaderboard for the level
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
	levelIds: number[],
	downloads: number,
	lovedCount: number
}
```

### ExtendedPackInfo
Contains metadata about a pack.
```typescript
{
	id: number,
	name: string,
	description: string,
	createdBy: ProfileInfo,
	createdAt: number,
	levels: LevelInfo[],
	downloads: number,
	lovedCount: number,
	lovedByYou: boolean // Indicates if the logged-in user has loved the pack
}
```

### CommentInfo
Contains data about a comment.
```typescript
{
	id: number,
	author: ProfileInfo,
	time: number,
	content: string
}
```

### ProfileInfo
Contains metadata about a profile.
```typescript
{
	id: number,
	username: string,
	hasAvatar: boolean,
	isModerator: boolean
}
```

### ExtendedProfileInfo
Contains metadata about a profile, as well as additional data to display on the Profile page.
```typescript
ProfileInfo & {
	bio: string,
	uploadedLevels: LevelInfo[], // Newest levels first
	createdPacks: PackInfo[]
}
```

### SignInInfo
Contains data that is remembered by the client upon login.
```typescript
{
	profile: ProfileInfo,
	packs: { // A list of all packs belonging to that user
		id: number,
		name: string,
		levelIds: number[]
	}[]
}
```

### HomeInfo
Describes the data displayed on the Home page.
```typescript
{
	latestLevels: LevelInfo[]
}
```

# MBPak Support
Marbleland also supports retrieving levels as MBPak archives that can be directly installed by PQ without having to extract it. To set it up, you require a key.txt containing the RSA and AES-256 encryption keys at the server/data directory.  
Format of key.txt: (replace RSAKEYRSAKEY... with your RSA key)
```
# -----BEGIN RSA PRIVATE KEY-----
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# -----END RSA PRIVATE KEY-----
# -----BEGIN RSA PUBLIC KEY-----
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# RSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEYRSAKEY
# -----END RSA PUBLIC KEY-----
# -----BEGIN AES KEY-----
# < SHA256 hash of any plaintext password to be used as aes key, remove the brackets >
# -----END AES KEY-----
```