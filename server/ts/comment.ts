import { CommentInfo } from "../../shared/types";
import { AccountDoc, getProfileInfo } from "./account";
import { db } from "./globals";

export interface CommentDoc {
	_id: number,
	for: number,
	forType: 'level',
	author: number,
	time: number,
	content: string
}

export const getCommentInfo = async (doc: CommentDoc): Promise<CommentInfo> => {
	let authorDoc = await db.accounts.findOne({ _id: doc.author }) as AccountDoc;

	return {
		id: doc._id,
		author: await getProfileInfo(authorDoc),
		time: doc.time,
		content: doc.content
	};
};

export const getCommentInfosForLevel = async (levelId: number) => {
	let commentDocs = await db.comments.find({ forType: 'level', for: levelId }) as CommentDoc[];
	commentDocs.sort((a, b) => b.time - a.time);
	let commentInfos: CommentInfo[] = [];
	for (let commentDoc of commentDocs) {
		commentInfos.push(await getCommentInfo(commentDoc));
	}

	return commentInfos;
};