import {GET_FEDERATIONS}  from '../../constants';

const initialState = [];

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_FEDERATIONS:
            return [...action.payload];
        default:
            return state;
    }
}