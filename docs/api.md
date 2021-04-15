# API Documentation

## Data types
### LevelInfo
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
Returns a list of all levels as an array of LevelInfo.