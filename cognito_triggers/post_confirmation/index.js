const request = require('request');

const query = `
mutation addUser($id: uuid!, $name:String!, $email: String!){
  insert_users(objects:[{
    email: $email
    id: $id
    name: $name
  }], on_conflict: {constraint: users_pkey, update_columns: name}) {
    returning {
      email
    }
  }
}
`

exports.handler = (event, context, callback) => {
  const qv = {
   id : event.request.userAttributes.sub,
   name :  event.request.userAttributes.name,
   email : event.request.userAttributes.email
  };
  
  const admin_secret = process.env.admin_secret;
  const url = process.env.hasura_url;
  request.post({
      headers: {'content-type' : 'application/json', 'x-hasura-admin-secret': admin_secret},
      url:   url,
      body:  JSON.stringify({query: query, variables: qv})
  }, function(error, response, body){
       callback(null, event);
  });
    
};