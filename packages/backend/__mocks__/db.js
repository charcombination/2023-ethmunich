const { Sequelize } = require('sequelize');

const define = jest.fn(() => ({
  sync: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

const sequelize = new Sequelize('sqlite::memory:', {
  logging: false,
});

sequelize.define = define;

module.exports = {
  sequelize,
  Sequelize,
};
