const MIN_ROOM_NUMBER = 1;
const MAX_ROOM_NUMBER = 99;

const asInteger = (value, label) => {
  const number = Number(value);

  if (!Number.isInteger(number)) {
    throw new TypeError(`${label} must be an integer`);
  }

  return number;
};

const normalizeRoomTypeCode = (value) => {
  const code = String(value || '')
    .trim()
    .toUpperCase();

  if (!/^[A-Z]$/.test(code)) {
    throw new TypeError('Room type code must be one uppercase letter');
  }

  return code;
};

const generateRoomCode = (roomTypeCode, floorNumber, roomNumber) => {
  const code = normalizeRoomTypeCode(roomTypeCode);
  const floor = asInteger(floorNumber, 'Floor number');
  const room = asInteger(roomNumber, 'Room number');

  if (floor < 1) {
    throw new RangeError('Floor number must be greater than zero');
  }

  if (room < MIN_ROOM_NUMBER || room > MAX_ROOM_NUMBER) {
    throw new RangeError('Room number must be between 1 and 99');
  }

  return `${code}${floor}${String(room).padStart(2, '0')}`;
};

const generateRoomCodes = (
  roomTypeCode,
  floorNumber,
  startingRoomNumber,
  quantity
) => {
  const start = asInteger(startingRoomNumber, 'Starting room number');
  const count = asInteger(quantity, 'Quantity');

  if (count < 1) {
    throw new RangeError('Quantity must be greater than zero');
  }

  const finalRoomNumber = start + count - 1;

  if (start < MIN_ROOM_NUMBER || finalRoomNumber > MAX_ROOM_NUMBER) {
    throw new RangeError('Generated room numbers must be between 1 and 99');
  }

  return Array.from({ length: count }, (_, index) => {
    const roomNumber = start + index;

    return {
      roomNumber,
      roomCode: generateRoomCode(roomTypeCode, floorNumber, roomNumber),
    };
  });
};

const roomCodeUtils = {
  MAX_ROOM_NUMBER,
  MIN_ROOM_NUMBER,
  generateRoomCode,
  generateRoomCodes,
  normalizeRoomTypeCode,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = roomCodeUtils;
}

globalThis.hostelRoomCodeUtils = roomCodeUtils;
