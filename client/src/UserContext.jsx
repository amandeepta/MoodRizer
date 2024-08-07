import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  // Add a user
  const addUser = (user) => {
    setUsers((prevUsers) => [...prevUsers, user]);
  };

  // Remove a user
  const removeUser = (userName) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.name !== userName));
  };

  return (
    <UserContext.Provider value={{ users, addUser, removeUser }}>
      {children}
    </UserContext.Provider>
  );
};

// PropTypes validation
UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserContext;
