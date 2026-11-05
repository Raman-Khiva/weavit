import { BASE_URL, REQUEST_PARAMS } from '../config/enviornment'
import {WeavitPlatformAPIClient} from '../generated/weavitPlatformAPI'



export const api = new WeavitPlatformAPIClient(
    {baseUrl : BASE_URL,
    commonRequestParameters : REQUEST_PARAMS
}
    );