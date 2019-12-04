const fetch = require('node-fetch');

const queryUserCart = `
    query getUserCart ($id: uuid!) {
      users_by_pk(id:$id) {
        cart_items {
        id
        quantity
        item {
            id
            img
            description
            title
            price,
            store_id
           }
        }
      }
    }
`;

const adminSecret = process.env.HASURA_SECRET;
const hasuraEndpoint = process.env.HASURA_URL;

module.exports = async function getCart(userId) {
  const qv = {id: userId};
  let cartItems = [];
  
  await fetch(hasuraEndpoint, {
    method: 'POST',
    body: JSON.stringify({query: queryUserCart, variables: qv}),
    headers: {'Content-Type': 'application/json', 'x-hasura-admin-secret': adminSecret},
  })
  .then(response => response.json())
  .then(json => {
    cartItems = json;
  });
  return cartItems;
};
