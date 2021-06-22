import * as df from "durable-functions"
import { AzureFunction, Context } from "@azure/functions"

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {

    const client = df.getClient(context)
    const instanceId = await client.startNew(process.env["MainOrchestratorName"], undefined, undefined)

    context.log(`Started timer triggered orchestration with ID = '${instanceId}'.`)

}

export default timerTrigger