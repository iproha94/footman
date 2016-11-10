import {
    GET_CURRENT_USER,
    GET_FEDERATIONS,
    ADD_FEDERATION_CURRENT_USER,
    ADD_TEAM_CURRENT_USER
}  from '../../constants';

const initialState = {
    name: "",
    _id: "",
    teams: [],
    federations: [],
    newUser: false,
    image: '/img/camera.png'
};


export default function(state = initialState, action) {
    switch (action.type) {
        case GET_CURRENT_USER:
            return {...state, ...action.payload};
        case GET_FEDERATIONS:
            var newState = {...state};
            newState.federations = [...action.payload];
            return newState;
        case ADD_FEDERATION_CURRENT_USER:
            var newState = {...state};
            newState.federations.push(action.payload);
            return newState;
        case ADD_TEAM_CURRENT_USER:
            var newState = {...state};
            newState.teams.push(action.payload);
            return newState;
        default:
            return state;
    }
}