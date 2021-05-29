const matrix = getMatrix(10, 10);

for (let i = 0; i < 10; i++) {
    setRandomMine(matrix);
}

gameInformation.getMines(matrix);
const update = (matrix) => {
    const gameCreate = gameConstructor(matrix);

    const app = document.getElementById('app');
    app.innerHTML = '';

    const informationForUser = document.createElement('div');
    informationForUser.classList.add('info__for__user')
    app.append(informationForUser);
    informationForUser.innerHTML = `flags: ${gameInformation.flags};`

    app.append(gameCreate);
}

update(matrix);