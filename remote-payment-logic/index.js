const ApolloServerLambda = require('apollo-server-lambda').ApolloServer;
const gql = require('graphql-tag');
const jwt = require('jsonwebtoken');
const getCart = require('./getCart.js');
const createAnOrder = require('./createOrder');
const convertCart = require('./convertCart');
const deleteCart = require('./deleteCart');


const typeDefs = gql`
    type Query {
        hello:  String
    }

    type Mutation {
        createOrder(token: String!):  Order!
    }
    
    type Order {
        id: ID!
        status: String!
    }
  
`;

const resolvers = {
  Query: {
    hello: (parent, args, context) => {
      const userId = context.headers['x-hasura-user-id'];
      return userId;
    },
  },
  Mutation: {
    createOrder: async (parent, args, context) => {
      console.log("Received Context", context)
      const stripeToken = args.token;
      const authHeaders = context.headers.Authorization;
      
      try {
        const token = authHeaders.replace('Bearer ', '');
        const decoded = jwt.decode(token);
        const userId = decoded.sub;
        // const userId = '6aa9ae88-a45c-435c-87e5-0b7c1a232eda';
        if (stripeToken && userId) {
          console.log("user and token", userId, stripeToken);
          // Get Cart
          const cartByUser = await getCart(userId);
          console.log("Got cart by user", JSON.stringify(cartByUser));
          const cartItems = cartByUser.data.users_by_pk.cart_items;
          
          //Charge to Stripe && Create order
          const order = await createAnOrder(cartItems, stripeToken, userId);
          
          // Convert cart to order items
          const convertedCart = await convertCart(cartItems, order, userId);
          console.log("Converted Cart, moving on", convertedCart);
          //delete cartItems
          const deletedCart = await deleteCart(cartItems);
          console.log("Deleted Cart, moving on", deletedCart);
          //return order Id
          return  {
            id: order.id,
            status: `paid`
          };
        } else {
          return null;
        }
        
      } catch(e) {
        console.log(e);
        return null;
      }
    }
  }
};

const server = new ApolloServerLambda({
  typeDefs,
  resolvers,
  context: ({ event, context }) => ({
    headers: event.headers,
    functionName: context.functionName,
    event,
    context,
  }),
});

exports.handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization'
  },
});



exports.typeDefs = typeDefs;
exports.resolvers = resolvers;
