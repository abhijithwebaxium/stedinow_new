import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let socket;

export const initiateSocketConnection = () => {
  if (socket && socket.connected) return socket;
  
	socket = io(API_URL, {
		withCredentials: true,
    path: '/socket.io',
    transports: ['websocket', 'polling'], // Explicitly allow websocket
	});
	console.log('Connecting to socket...');
	return socket;
};

export const disconnectSocket = () => {
	console.log('Disconnecting socket...');
	if (socket) socket.disconnect();
};

export const joinStudentRoom = (studentId) => {
	if (socket && studentId) socket.emit('join_student', studentId);
};

export const joinAdminRoom = () => {
	if (socket) socket.emit('join_admin');
};

export const getSocket = () => socket;
