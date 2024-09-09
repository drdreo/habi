exports = async function (changeEvent) {
    // A Database Trigger will always call a function with a changeEvent.
    // Documentation on ChangeEvents: https://docs.mongodb.com/manual/reference/change-events/

    // Access the _id of the changed document:
    const docId = changeEvent.documentKey._id;

    // Get the MongoDB service you want to use (see "Linked Data Sources" tab)
    // Note: In Atlas Triggers, the service name is defaulted to the cluster name.
    const serviceName = "Cluster0";
    const database = "habits";
    const collection = context.services
        .get(serviceName)
        .db(database)
        .collection(changeEvent.ns.coll);
    const archiveCollection = context.services
        .get(serviceName)
        .db(database)
        .collection("archive_dev_habit_completions");

    try {
        // If this is an "update" or "replace" event, then replace the document in the other collection
        let completionLimit = 500;
        const { frequency, target_metric, completions, user_id } =
            changeEvent.fullDocument;
        switch (frequency) {
            case "daily":
                completionLimit = target_metric.goal * 7 * 6; // archive after 6 weeks completing the goal
                break;
            case "weekly":
                completionLimit = 100;
                break;
        }

        // Archive completions if they exceed the limit
        if (completions.length > completionLimit) {
            const oldCompletions = completions.slice(
                0,
                completions.length - completionLimit
            ); // Get older completions

            // Move old completions to archive collection
            await archiveCollection.insertMany(
                oldCompletions.map((c) => ({ habit_id: docId, user_id: user_id, ...c }))
            );

            // Remove old completions from the current task document
            await collection.updateOne(
                { _id: docId },
                {
                    $set: {
                        completions: completions.slice(
                            completions.length - completionLimit
                        ),
                    },
                }
            );
        }
    } catch (err) {
        console.log("error performing mongodb write: ", err.message);
    }
};
