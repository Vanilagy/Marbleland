import { authorize } from "../account";
import { CommentDoc, getCommentInfosForLevel } from "../comment";
import { db } from "../globals";
import { app } from "../server";

export const initCommentApi = () => {
	// Delete a comment
	app.delete('/api/comment/:commentId/delete', async (req, res) => {
		let doc = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		let commentDoc = await db.comments.findOne({ _id: Number(req.params.commentId) }) as CommentDoc;
		if (!commentDoc) {
			res.status(400).end();
			return;
		}

		// Ensure the one deleting it is the one who wrote it
		if (commentDoc.author !== doc._id) {
			res.status(403).end();
			return;
		}

		await db.comments.remove({ _id: commentDoc._id }, {});

		// Send back a list of all comments for this level.
		// NOTE! Adjust this for when there's gonna be comment for more than just levels.
		res.send(await getCommentInfosForLevel(commentDoc.for));
	});
};