import { faker } from '@faker-js/faker';

export function genData (num) {
  
  // create fake data list
  const genData = [];

  // push data to list
  for (let i = 0; i < num; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const registeredDate = faker.date.past().toLocaleDateString();

    genData.push({
      id: i + 1,
      firstName,
      lastName,
      email: faker.internet.email(),
      city: faker.location.city(),
      registeredDate,
    });
  }
  
  return genData;
};