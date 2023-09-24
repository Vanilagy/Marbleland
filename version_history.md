# Version history

## 1.4.15
- Added logic to recover state after data loss

## 1.4.14
- Added support for custom datablocks and AudioEmitters
- Added manual dependency inclusion using the @include directive

## 1.4.13
- Fixed more incorrect level archives

## 1.4.12
- Fixed incorrect level archives

## 1.4.11
- Don't include preview images with archives for MBG

## 1.4.10
- Fixed XSS in MissionInfo code editor
- Slight style adjustments

## 1.4.9
- Fixed editing with escaped characters

## 1.4.8
- Added stats to profiles

## 1.4.7
- Added labels to levels that utilize custom code in their .mis file
- Added download spam protection

## 1.4.6
- Added automated git backups

## 1.4.5
- Fixed a game mode-related search bug

## 1.4.4
- Fixed a MissionInfo editing bug

## 1.4.3
- Improved game type stuff

## 1.4.2
- Refined MissionInfo editing

## 1.4.1
- Fixed lost data upon level editing

## 1.4.0
- Added the ability to edit non-gameplay MissionInfo fields of uploaded levels
- Fixed some .mis parser quirks
- Made some small cosmetic changes

## 1.3.3
- Fixed ImageMagick memory leaks

## 1.3.2
- Changed header design

## 1.3.1
- Fixed some upload-related issues

## 1.3.0
- Added support for batch level upload
- Added more functionality to level upload, such as adding to packs
- Added a large preview image to level pages should a preview image (.prev.png / .prev.jpg) be present
- Added thumbnail image support for .dds and .bmp files

## 1.2.3
- Fixed some styling issues

## 1.2.2
- Added support for MusicTriggers
- Bumped up .zip size limit

## 1.2.1
- Fixed incorrect dependency resolution in some cases
- Fixed URL recognition

## 1.2.0
- Added ability to mark levels and packs as loved
- Added ability to sort levels and packs by downloads and loves

## 1.1.3
- Fixed pack thumbnails failing sometimes

## 1.1.2
- Levels/packs are now sorted by date by default
- Fixed macOS-specific .zip errors
- Other small fixes

## 1.1.1
- Added an additional API options to allow a level's ID to be appended to the end of its .mis file
- Small fixes and improvements

## 1.1.0
- Added API support for .mbpak level export
- Changed order of uploaded levels in profiles to be newest-to-oldest
- Fixed file extension case bugs
- Fixed unintuitive behavior of `--reimport`

## 1.0.2
- Small style fixes and improvements

## 1.0.1
- Improved search bar placeholders
- Made all dropdown popups properly disappear when clicking somewhere else
- Fixed pack bugs

## 1.0.0
The first non-beta version of Marbleland. It has a number of improvements over the beta:
- Added batch level download to the search page
- Added drag and drop support for level upload
- Added filter by game mode
- Added level reordering support for packs
- Added music dependencies
- Added moderator role
- Various small improvements and fixes

## 0.0.3
- Refined caching logic
- Changed progress bar colors
- Relaxed OBJECT WRITE BEGIN/END policy

## 0.0.2
- Added cookie-based authentication
- Style fixes
- Fixed search bar bugs

## 0.0.1
- Fixed OpenGraph metadata
- Fixed case-insensitive path matching
- Fixed Vue-related navigation bugs

## 0.0.0
Initial beta release