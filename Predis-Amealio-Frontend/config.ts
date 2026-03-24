const ENV:any = "DEVELOPMENT";   // DEVELOPMENT | STAGE | PRODUCTION


const DEV_CONFIG ={
    NEXT_PUBLIC_BACKEND_URL: 'https://dev-predis-api.amealio.com',
    NEXT_PUBLIC_INSTAGRAM_CLIENT_ID:2419028528512787,
    NEXT_PUBLIC_REDIRECT_URI:"http://localhost:5000/oauth/callback"
}

const STAGE_CONFIG ={
    NEXT_PUBLIC_BACKEND_URL: 'http://localhost:8001',
    NEXT_PUBLIC_INSTAGRAM_CLIENT_ID:2419028528512787,
    NEXT_PUBLIC_REDIRECT_URI:"http://localhost:5000/oauth/callback"
}

const PRODUCTION_CONFIG ={
    NEXT_PUBLIC_BACKEND_URL: 'http://localhost:8001',
    NEXT_PUBLIC_INSTAGRAM_CLIENT_ID:2419028528512787,
    NEXT_PUBLIC_REDIRECT_URI:"http://localhost:5000/oauth/callback"
}

export let CONFIG:any;

switch (ENV) {
    case "DEVELOPMENT":
        CONFIG = DEV_CONFIG;
        break;
    case "STAGE":
        CONFIG = STAGE_CONFIG;
        break;
    case "PRODUCTION":
        CONFIG = PRODUCTION_CONFIG;
        break;
}