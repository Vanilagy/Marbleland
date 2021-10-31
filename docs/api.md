# API Documentation

All of Marbleland's functionality can be accessed programatically through an API which is documented here. A few notes on the format: If in JSON form, response and request body types are specified using the **TypeScript type syntax**. All query parameters are always optional.

- [Authentication](#authentication)
- [API endpoints](#api-endpoints)
	- [Level](#level)
	- [Comment](#comment)
	- [Account](#account)
	- [Pack](#pack)
	- [Home](#home)
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

### `GET` /api/level/{level-id}/zip
Get the .zip archive for a given level.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of default assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.

### `GET` /api/level/{level-id}/mbpak
Get the .mbpak archive for a given level.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of default assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.

### `GET` /api/level/{level-id}/image
Get the image thumbnail for a given level.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
original | `boolean` | If set, the original, uncompressed image thumbnail will be returned. Takes precedence over `width` and `height`.
width | `number` | When used together with `height`, specifies the dimensions to resize the image to. The original image will be stretched to cover the new dimensions while maintaining its aspect ratio.
height | `number` | *See `width`.*

### `GET` /api/level/{level-id}/dependencies
Returns a list of files (assets) a given level depends on as an array of `string`. Essentially returns the file paths of the .zip.

**Query parameters:**

Name | Type | Meaning
--- | --- | ---
assuming | `'none' \| 'gold' \| 'platinumquest'` | *Defaults to `'platinumquest'`.* If present, specifies the set of default assets to exclude from the archive. For example, if set to `'gold'`, all MBG default assets won't be included with the .zip.

### `GET` /api/level/{level-id}/info
Returns the metadata for a given level in the form of [LevelInfo](#levelinfo).

### `GET` /api/level/{level-id}/extended-info
Returns the extended information for a given level in the form of [ExtendedLevelInfo](#extendedlevelinfo).

### `GET` /api/level/{level-id}/mission-info
Returns the raw MissionData ScriptObject of the .mis file as a `Record<string, string | string[]>`.

### `GET` /api/level/{level-id}/packs
Returns a list of packs a given level appears in as an array of [PackInfo](#packinfo).
### `POST` /api/level/upload
**Requires [authentication](#authentication).** Uploads a .zip archive containing a level and primes it for submission.

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
	uploadId: number, // The random ID of this upload. Needs to be remembered for submission.
	warnings: string[] // A list of warnings about the uploaded archive
}
```

### `POST` /api/level/submit
**Requires [authentication](#authentication).** Submits a previously uploaded level, that is, adds it to the database and makes it accessible.

**Request body (`Content-Type: application/json`):**
```typescript
{
	uploadId: number,
	remarks: string // Additional remarks to display on the level's page
}
```

**Response body:**
```typescript
{
	levelId: number // The ID of the submitted level
}
```

### `PATCH` /api/level/{level-id}/edit
**Requires [authentication](#authentication).** Edit the metadata of a previously submitted level. Right now, only the level's remarks can be edited.

**Request body (`Content-Type: application/json`):**
```typescript
{
	remarks: string
}
```

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

## Home
### `GET` /api/home/info
Returns the necessary data for the Home page in the form of [HomeInfo](#homeinfo).

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
	hasEasterEgg: boolean
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
	missesDependencies: boolean
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
	downloads: number
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
	uploadedLevels: LevelInfo[],
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