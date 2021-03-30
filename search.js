// Imports
const chalk = require('chalk');
const fetch = require('node-fetch');
const moment = require('moment');

// Constants
const refreshInterval = 60 * 1000;
const intraSearchDelay = 5 * 1000;
const zips = [
  '11201', // Brooklyn Heights/Cobble Hill
  '11206', // Williamsburg/Bedford-Stuyvesant
  '11216', // Bedford-Stuyvesant
  '11218', // Kensington/Windsor Terrace
  '11220', // Sunset Park
  '11222', // Greenpoint
  '11226', // Flatbush
  '11231', // Carroll Gardens/Red Hook
  '11235', // Sheepshead Bay/Brighton Beach
  '11237', // Bushwick
  '11205', // Fort Greene,
  '11209', // Bay Ridge
  '11211', // Williamsburg
  '11215', // Park Slope/Windsor Terrace
  '11217', // Park Slope Gowanus
  '11225', // Crown Heights
  '11232', // Industry City/Sunset Park
  '11238', // Prospect Heights,
  '10004', // Lower Manhattan
  '10004', // Lower Manhattan
  '10005', // Lower Manhattan
  '10006', // Lower Manhattan
  '10007', // Lower Manhattan
  '10038', // Lower Manhattan
  '10280', // Lower Manhattan
  '10001', // Chelsea
  '10011', // Chelsea
  '10018', // Chelsea
  '10019', // Chelsea
  '10020', // Chelsea
  '10036', // Chelsea
  '10010', // Gramercy Park/Murray Hill
  '10016', // Gramercy Park/Murray Hill
  '10017', // Gramercy Park/Murray Hill
  '10022', // Gramercy Park/Murray Hill
  '10012', // Greenwich Village/Soho
  '10013', // Greenwich Village/Soho
  '10014', // Greenwich Village/Soho
  '10002', // Union Square/Lower East Side
  '10003', // Union Square/Lower East Side
  '10009', // Union Square/Lower East Side
];

const filteredCenterNames = [
  'Bronx Co-Op City Dreiser Community Center',
  'Hospital for Special Surgery',
  'Empire Outlets',
];

// Helpers
const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

// Search
const search = async () => {
  console.log(chalk.gray(`\n${moment().format('YYYY-MM-DD hh:mma')}`));

  const date = moment().format('YYYY-MM-DD');

  for (const zip of zips) {
    try {
      // https://vax4nyc.nyc.gov/patient/s/vaccination-schedule
      const res = await fetch('https://vax4nyc.nyc.gov/patient/s/sfsites/aura?r=11&aura.ApexAction.execute=1', {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'sec-fetch-mode': 'cors',
        },
        body: `message=%7B%22actions%22%3A%5B%7B%22id%22%3A%2294%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FApexActionController%2FACTION%24execute%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22namespace%22%3A%22%22%2C%22classname%22%3A%22VCMS_BookAppointmentCtrl%22%2C%22method%22%3A%22fetchDataWrapper%22%2C%22params%22%3A%7B%22isOnPageLoad%22%3Afalse%2C%22scheduleDate%22%3A%22${date}%22%2C%22zipCode%22%3A%22${zip}%22%2C%22selectedVeventId%22%3Anull%2C%22selectedVeventDate%22%3Anull%2C%22selectedSlotTime%22%3Anull%2C%22isSecondDose%22%3Afalse%2C%22appointmentSlotId%22%3Anull%2C%22vaccineName%22%3A%22%22%2C%22isReschedule%22%3Afalse%2C%22isClinicPortal%22%3Afalse%2C%22isCallCenter%22%3Afalse%2C%22patientZipCode%22%3A%22${zip}%22%2C%22patientDob%22%3A%221986-10-24%22%2C%22patientEligibility%22%3A%5B%22People%20ages%2065%20and%20older%22%5D%7D%2C%22cacheable%22%3Afalse%2C%22isContinuation%22%3Afalse%7D%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%22Q8onN6EmJyGRC51_NSPc2A%22%2C%22app%22%3A%22siteforce%3AcommunityApp%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fsiteforce%3AcommunityApp%22%3A%22XrAWq7KlNf8wSyobBsPNEA%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.pageURI=%2Fpatient%2Fs%2Fvaccination-schedule&aura.token=undefined`,
        method: 'POST',
        mode: 'cors',
      });

      const { actions } = await res.json();

      const results = actions[0].returnValue.returnValue.lstMainWrapper.filter((result) => {
        const centerName = result.lstDataWrapper.centerName || result.lstDataWrapper[0].centerName;

        if (!centerName) {
          console.log(result);
          throw new Error('Center Name is blank');
        }

        return !filteredCenterNames.includes(centerName);
      });

      if (results.length) {
        console.log(chalk.green.bold(`There may be appointments available for ${zip} on ${date}`));
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log(chalk.red(`No appointments available for ${zip} on ${date}`));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err}`));
    }

    await sleep(intraSearchDelay);
  }

  setTimeout(search, refreshInterval);
};

search();
