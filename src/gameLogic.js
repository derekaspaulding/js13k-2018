export const PLAYERS = {
  PLAYER1: 'PLAYER1',
  PLAYER2: 'PLAYER2',
}

const STATE_KEYS = {
  currentPlayer: 'currentPlayer',
}

const initialState = {
  [STATE_KEYS.currentPlayer]: PLAYERS.PLAYER1,
}

export default class GameLogic {
  constructor() {
    this.state = initialState;
    this.history = [];
  }

  switchPlayer() {
    const currentPlayer = this.getCurrentPlayer();
    const newPlayer = currentPlayer === PLAYERS.PLAYER1 ? PLAYERS.PLAYER2 : PLAYERS.PLAYER1;
    this._updateState({ [STATE_KEYS.currentPlayer]: newPlayer });
  }

  getCurrentPlayer() {
    return this.state[STATE_KEYS.currentPlayer];
  }

  isValidMove(edge, connectedEdges) {
    const currentPlayer = this.getCurrentPlayer();
    if (edge.owner === currentPlayer) {
      return false;
    }
    return connectedEdges.some(connectedEdge => connectedEdge.owner === currentPlayer);
  }

  _updateState(updates) {
    this.history.push(Object.assign({}, this.state));
    const newState = Object.keys(STATE_KEYS).reduce((newState, stateKey) => {
      if(updates[stateKey] !== undefined) {
        newState[stateKey] = updates[stateKey]
      }
      return newState;
    }, Object.assign({}, this.state));
    this.state = newState;
  }
}