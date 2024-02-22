import {Storage} from 'aws-amplify';

export const createFolderObject = async pathString => {
  try {
    const response = await Storage.list(pathString, {pageSize: 'ALL'});
    const main = {};
    for (const result of response.results) {
      const split = result.key.split('/');
      let cur = main;
      for (let i = 0; i < split.length - 1; i++) {
        split[i] = split[i] + '/';
        const newKey = split[i];
        if (!(newKey in cur)) {
          cur[newKey] = {};
        }
        cur = cur[newKey];
      }
      if (split[split.length - 1] !== '') {
        cur[split[split.length - 1]] = result.key;
      }
    }
    return main;
  } catch (err) {
    console.log(err);
  }
};
