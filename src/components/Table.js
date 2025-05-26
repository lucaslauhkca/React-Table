import { useEffect, useState } from 'react';
import { genData } from '../data/GenData';

// set first load
const BATCH_SIZE = 30;

// define initial columns
const defaultColumns = [
  { id: 'id', label: 'ID' },
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'fullName', label: 'Full Name' },
  { id: 'email', label: 'Email' },
  { id: 'city', label: 'City' },
  { id: 'registeredDate', label: 'Registered Date' },
  { id: 'dsr', label: 'DSR' },
];

const Table = () => {
  const [userData] = useState(genData(500)); // generate data
  const [displayUsers, setDisplayUsers] = useState(userData.slice(0, BATCH_SIZE)); // lazy loading
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [sortState, setSortState] = useState({ key: '', direction: 'asc' });
  const [tableColumns, setTableColumns] = useState(defaultColumns);
  const [dragStartIndex, setDragStartIndex] = useState(null);

  // handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 50 >=
        document.documentElement.offsetHeight
      ) {
        loadMoreUsers();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayUsers]);

  const loadMoreUsers = () => {
    if (!canLoadMore) return;
    
    // check remaining data
    const nextBatch = userData.slice(displayUsers.length, displayUsers.length + BATCH_SIZE);
    setDisplayUsers(prev => [...prev, ...nextBatch]);
    if (displayUsers.length + BATCH_SIZE >= userData.length) {
      setCanLoadMore(false);
    }
  };

  // handle column sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortState.key === key && sortState.direction === 'asc') {
      direction = 'desc';
    }

    const sortedUsers = [...displayUsers].sort((a, b) => {
      const aVal = getUserValue(a, key);
      const bVal = getUserValue(b, key);
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortState({ key: key, direction });
    setDisplayUsers(sortedUsers);
  };

  const getSortArrow = (key) => {
    if (sortState.key !== key) return '';
    return sortState.direction === 'asc' ? ' ▲' : ' ▼';
  };

  // handle extra fields
  const getUserValue = (user, key) => {
    if (key === 'fullName') return `${user.firstName} ${user.lastName}`;
    if (key === 'dsr') {
      const today = new Date();
      const registered = new Date(user.registeredDate);
      const dsr = Math.abs(today - registered);
      return Math.floor(dsr / (1000 * 60 * 60 * 24));
    }
    return user[key];
  };

  // handle column drag & drop
  const handleDragStart = (index) => {
    setDragStartIndex(index);
  };

  const handleDrop = (dropIndex) => {
    if (dragStartIndex === null || dragStartIndex === dropIndex) return;

    const updatedColumns = [...tableColumns];
    const [dragged] = updatedColumns.splice(dragStartIndex, 1);
    updatedColumns.splice(dropIndex, 0, dragged);
    setTableColumns(updatedColumns);
    setDragStartIndex(null);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">User Table</h1>
      <p className="text-center mb-4 lead">This table supports infinite scrolling, sortable and draggable columns.</p>
      <div className="table-responsive">
        <table className="table table-striped table-dark table-hover">
            <thead className="align-middle">
                <tr>
                    {tableColumns.map((col, idx) => (
                    <th
                        className="bg-warning p-3"
                        key={col.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(idx)}
                        onClick={() => handleSort(col.id)}
                    >
                        {col.label}
                        {getSortArrow(col.id)}
                    </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {displayUsers.map((user) => (
                    <tr key={user.id}>
                    {tableColumns.map((col) => (
                        <td className="p-3" key={`${user.id}-${col.id}`}>{getUserValue(user, col.id)}</td>
                    ))}
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
