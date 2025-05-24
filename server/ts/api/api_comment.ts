import { authorize, isSuspended } from "../account";
import { CommentDoc, getCommentInfosForLevel } from "../comment";
import { db } from "../globals";
import { app } from "../server";

export const initCommentApi = () => {
	// Delete a comment
	app.delete('/api/comment/:commentId/delete', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let commentDoc = await db.comments.findOne({ _id: Number(req.params.commentId) }) as CommentDoc;
		if (!commentDoc) {
			res.status(400).end();
			return;
		}

		// Ensure the one deleting it has permission to do so
		if (commentDoc.author !== doc._id && !doc.moderator) {
			res.status(403).end();
			return;
		}

		await db.comments.remove({ _id: commentDoc._id }, {});

		// Send back a list of all comments for this level.
		// NOTE! Adjust this for when there's gonna be comment for more than just levels.
		res.send(await getCommentInfosForLevel(commentDoc.for));
	});
};