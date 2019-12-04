const { ApolloServer } = require('apollo-server');
const express = require('express');
const app = express();

const { typeDefs, resolvers } = require('./index');

const context = ({req}) => {
  return {headers: req.headers};
};

const helloSchema = new ApolloServer({
  typeDefs, resolvers, context
});

helloSchema.listen().then(({ url }) => {
  console.log(`schema ready at ${url}`);
});
