import React, { useState, useEffect } from "react";
import { Text, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons/';
import { Container, Row, Col } from 'react-native-flex-grid';
import styles from '../style/style';
import { 
    NBR_OF_DICES,
    NBR_OF_THROWS,
    MIN_SPOT,
    MAX_SPOT,
    BONUS_POINTS_LIMIT,
    BONUS_POINTS } from '../constants/Game';
import Header from "./Header";
import Footer from "./Footer";

// Game variables
let board = [];
let numbersNumbers = [0, 0, 0, 0, 0, 0];
let nbrSelectPossible = false;
let diceSelectPossible = false;
let throwPossible = true;
let getBonus = false;
let gameOver = false;

// Gameboard
const Gameboard = () => {
    const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
    const [totalPoints, setTotalPoints] = useState(0);
    const [status, setStatus] = useState('');
    const [selectedDices, setSelectedDices] = useState(new Array(NBR_OF_DICES).fill(false));
    const [usedNbrs, setUsedNbrs] = useState(new Array(6).fill(false));

    // The number row.
    const nbrRow = Array.from({ length: 6 }, (_, i) => (
        <View style={styles.numbers} key={"nbrRow" + i}>
            <Text style={styles.numbersNumbers}>{numbersNumbers[i]}</Text>
            <Pressable
                key={"nbrRow" + i}
                onPress={() => useNbr(i)}
            >
                <MaterialCommunityIcons
                    name={'numeric-' + (i + 1) + '-circle'}
                    key={"nbrRow" + i}
                    size={50}
                    color={usedNbrs[i] ? "black" : "green"}
                />
            </Pressable>
        </View>
    ));

    // Pick which "numberNumbers" (1-6) to use for points (sum of dices with that number)
    const useNbr = (i) => {
        let nbrs = [...usedNbrs];
        if (nbrSelectPossible && !nbrs[i]) {
            nbrs[i] = true;
            setUsedNbrs(nbrs);

            // Calculate the sum of dice values for the selected number
            let currentSum = 0;
            for (let x = 0; x < NBR_OF_DICES; x++) {
                let diceVal = parseInt(board[x].substring(5));
                if (diceVal === i + 1) {
                    currentSum += diceVal;
                }
            }
            numbersNumbers[i] = currentSum;

            // Update total points and reset selected dices.
            setTotalPoints(totalPoints + currentSum);
            setSelectedDices(new Array(NBR_OF_DICES).fill(false));
            setNbrOfThrowsLeft(NBR_OF_THROWS);
        } else if (nbrs[i]) {
            setStatus("You already selected points for " + (i + 1));
        }
    }

    const selectDice = (i) => {
        if (diceSelectPossible) {
            let dices = [...selectedDices];
            dices[i] = selectedDices[i] ? false : true;
            setSelectedDices(dices);
        } else (
            setStatus("You have to throw the dices first.")
        )
    }

    const throwDices = () => {
        if (throwPossible && !gameOver) {
            for (let i = 0; i < NBR_OF_DICES; i++) {
                if (!selectedDices[i]) {
                    let randomNumber = Math.floor(Math.random() * MAX_SPOT + MIN_SPOT); // Random number between 1-6
                    board[i] = 'dice-' + randomNumber;
                }
            }
            setNbrOfThrowsLeft(nbrOfThrowsLeft - 1);
        } else if (gameOver) {
            newGame();
        }
    }

    // Conditions for throwing dices
    useEffect(() => {
        if (nbrOfThrowsLeft === 0) {
            setStatus('Pick a number');
            throwPossible = false;
            nbrSelectPossible = true;
        } else if (nbrOfThrowsLeft < NBR_OF_THROWS) {
            setStatus('Throw again or select a number');
            throwPossible = true;
            nbrSelectPossible = true;
            diceSelectPossible = true;
        } else if (nbrOfThrowsLeft === NBR_OF_THROWS && !usedNbrs.every(x => x === true)) {
            setStatus('Throw the dices');
            throwPossible = true;
            nbrSelectPossible = false;
            diceSelectPossible = false;
        } else if (nbrOfThrowsLeft === NBR_OF_THROWS && usedNbrs.every(x => x === true)) {
            setStatus('Game over! All points selected.');
            throwPossible = false;
            diceSelectPossible = false;
            nbrSelectPossible = false;
            gameOver = true;
        }
    }, [nbrOfThrowsLeft]);

    // How many points away from bonus
    const checkBonus = () => {
        if (totalPoints >= BONUS_POINTS_LIMIT) {
            getBonus = true;
            return ("Congrats! You got the Bonus !")
        } else {
            return ("You are " + (BONUS_POINTS_LIMIT - totalPoints) + " points away from bonus.");
        }
    }

    // Reset variables for new game and instantly throw the dices.
    const newGame = () => {
        gameOver = false;
        setTotalPoints(0);
        setUsedNbrs(new Array(6).fill(false));
        numbersNumbers = [0, 0, 0, 0, 0, 0];
        setNbrOfThrowsLeft(3);
        nbrSelectPossible = true;
        diceSelectPossible = true;
        throwPossible = true;
        getBonus = false;
        throwDices();
    }

    const diceRow = Array.from({ length: NBR_OF_DICES }, (_, i) => (
        <Pressable
            key={"row" + i}
            onPress={() => selectDice(i)}>
            <MaterialCommunityIcons
                name={board[i]}
                key={"row" + i}
                size={75}
                color={selectedDices[i] ? "black" : "green"}
            />
        </Pressable>
    ));

    return (
        <>
            <Header />
            <Container>
                <Row>
                    <Col>
                        <View style={styles.flex}>{diceRow}</View>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Text style={styles.buttonText}>Throws left: {nbrOfThrowsLeft}</Text>
                        <Text style={styles.gameboard}>{status}</Text>
                        <Pressable style={[styles.button]} onPress={() => throwDices()}>
                            <Text style={styles.buttonText}>
                                {gameOver ? 'New Game' : 'Throw Dices'}
                            </Text>
                        </Pressable>
                        <Text style={[styles.gameboard, styles.gamevalue]}>Total: {getBonus ? (totalPoints + BONUS_POINTS) : totalPoints}</Text>
                        <Text style={styles.gameboard}>{checkBonus()}</Text>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <View style={styles.flex}>{nbrRow}</View>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    );
    
};
export default Gameboard;
