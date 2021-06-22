﻿import { AzureFunction, Context } from "@azure/functions"

const activityFunction: AzureFunction = async function (context: Context): Promise<JSON> {

    context.log.info("Fetching global configuration for updates")

    return context.bindings.repositoryConfiguration
}

export default activityFunction