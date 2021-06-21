import * as df from "durable-functions"
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpStart: AzureFunction = async function (context: Context, req: HttpRequest): Promise<any> {
    const client = df.getClient(context)

    context.log.info("Manual start of Kyma Update Bot triggered via HTTP request")

    const instanceId = await client.startNew(process.env["MainOrchestratorName"], undefined, req.body)

    context.log(`Started orchestration with ID = '${instanceId}'.`)

    return client.createCheckStatusResponse(context.bindingData.req, instanceId)
}

export default httpStart
