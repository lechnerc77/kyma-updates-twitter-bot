import { AzureFunction, Context } from "@azure/functions"
import * as AzureTables from "azure-storage"

const activityFunction: AzureFunction = async function (context: Context) {

    context.log.info(`Started update of table entry for ${context.bindings.updateInformation.RowKey}`)

    const tableSvc = AzureTables.createTableService(process.env["myStorageConnectionString"])
    const entGen = AzureTables.TableUtilities.entityGenerator

    let tableEntry = {
        PartitionKey: entGen.String(process.env["HistoryPartitionKeyValue"]),
        RowKey: entGen.String(context.bindings.updateInformation.RowKey),
        RepositoryOwner: entGen.String(context.bindings.updateInformation.RepositoryOwner),
        RepositoryName: entGen.String(context.bindings.updateInformation.RepositoryName),
        Name: entGen.String(context.bindings.updateInformation.Name),
        TagName: entGen.String(context.bindings.updateInformation.TagName),
        PublishedAt: entGen.DateTime(context.bindings.updateInformation.PublishedAt),
        HtmlURL: entGen.String(context.bindings.updateInformation.HtmlUrl),
        UpdatedAt: entGen.DateTime(new Date().toISOString())
    }

    const result = await insertOrMergeEntity(tableSvc, process.env["HistoryEntityName"], tableEntry)

    context.log.info(`Table update executed for row ${context.bindings.updateInformation.RowKey} with new version ${context.bindings.updateInformation.Name} (Tag: ${context.bindings.updateInformation.TagName})`)

}

export default activityFunction

async function insertOrMergeEntity(tableSvc: AzureTables.TableService, ...args) {
    return new Promise((resolve, reject) => {
        let promiseHandling = (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        }

        args.push(promiseHandling)
        tableSvc.insertOrMergeEntity.apply(tableSvc, args)
    })
}