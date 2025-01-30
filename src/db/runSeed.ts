import seed from './seed';
import userData from './data/devData/users-dev.json';
import eventData from './data/devData/events-dev.json';
import signupData from './data/devData/signups-dev.json';
import savedData from './data/devData/saved-dev.json';
import externalData from './data/devData/external-dev.json';

seed({ users: userData, saved: savedData, events: eventData, signups: signupData, external: externalData });
