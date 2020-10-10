'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const TableName = 'users';
const region = 'eu-west-2';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

//Sign-Up
module.exports.signup = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const { firstName, lastName, email, phone, password } = requestBody;
  const id = uuid.v1();
  const timestamp = new Date().getTime();

  if (
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof email !== 'string'
  ) {
    console.error('Validation Failed');
    callback(
      new Error("Couldn't submit candidate because of validation errors.")
    );
    return;
  }

  const user = {
    id,
    firstName,
    lastName,
    email,
    phone,
    password,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };

  signUpUser(user)
    .then((res) => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Successfully submitted user with email ${email}`,
          candidateId: res.id,
        }),
      });
    })
    .catch((err) => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit candidate with email ${email}`,
        }),
      });
    });

  const signUpUser = (user) => {
    console.log('Submitting user');
    const userInfo = {
      TableName: 'users',
      Item: user,
    };
    return dynamoDb
      .put(userInfo)
      .promise()
      .then((res) => userInfo);
  };
};

module.exports.signIn = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const { email, password } = requestBody;

  if (typeof email !== 'string' || typeof password !== 'string') {
    console.error('Validation Failed');
    callback(
      new Error("Couldn't submit candidate because of validation errors.")
    );
    return;
  }

//Sign-In
  getUser(email)
    .then((res) => {
      res.password === password
        ? callback(null, {
            statusCode: 200,
            body: JSON.stringify({
              message: `Successfully submitted user with email ${email}`,
              candidateId: res.id,
            }),
          })
        : console.log('error');
    })
    .catch((err) => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to Login`,
        }),
      });
    });

  const getUser = (email) => {
    console.log('Getting user');
    const userInfo = {
      TableName: 'users',
      key: { email: email },
    };
    return dynamoDb
      .get(userInfo)
      .promise()
      .then((res) => userInfo);
  };
};

//Get All Users

//Delete a User

//Update a User