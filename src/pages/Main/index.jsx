import { useEffect, useState } from "react";
import "./style.css";
import axios from "axios";

export default function Main() {
    const [play, setPlay] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [options, setOptions] = useState([]);
    const [check, setCheck] = useState(false);
    const [correct, setCorrect] = useState(0);

    const app = axios.create({
        baseURL: 'https://opentdb.com/api.php?amount=10',
        timeout: 10000,
        headers: {'Content-type': 'Application/json'}
    });

    useEffect(() => {
        async function getData(){
            try {
                const response = await app.get();
                const data = await response.data.results;
                const results = data.map((item, index) => {
                return {...item, id: index, answers: [item.correct_answer, ...item.incorrect_answers]}
            });
            
            const isolatedAnswers = await results.map((item) => {
                return item.answers
            });

            const stateAnswers = isolatedAnswers.map((element, index) => {
                return element.map((item, index) => {
                    if(index === 0){
                        return {item, isCorrect: true, isSelected: false, isChecked: false, isDoubleChecked: false}
                    }
                    return {item, isCorrect: false, isSelected: false, isChecked: false, isDoubleChecked: false}
                });
            });

            for(let item of stateAnswers){
                for(let i = item.length - 1; i > 0; i--){
                    const j = Math.floor(Math.random() * (i + 1));
                    [item[i], item[j]] = [item[j], item[i]]
                }
            }

            setOptions(stateAnswers);
            setQuestions(results);

            } catch (error) {
                console.log(error);
            }
        }
        getData();
    }, [play]);

    function handleSelection(event){
        const localOptions = options;
        const {id} = event.target.parentElement;
        
        localOptions[Number(id)].forEach((item) => {
            item.isSelected = false;
            if(item.item === event.target.innerHTML.trim()){
                item.isSelected = !item.isSelected;
            }
        });
        setOptions((prevState) => {
            return prevState = [...localOptions];
        });
    }

    function handleCheck() {
        const localOptions = options;

        for(let element of localOptions){
            for(let item of element){
                if(item.isCorrect && item.isSelected){
                    item.isChecked = true;
                    setCorrect((prevState) => {
                        return prevState = prevState + 1;
                    });
                }
                if(!item.isCorrect && item.isSelected){
                    item.isDoubleChecked = true;
                }
                if(item.isCorrect && !item.isSelected){
                    item.isChecked = true;
                }
            }
        }

        setOptions((prevState) => {
            return prevState = [...localOptions];
        });

        setCheck(!check);
    }

    return(
        <main className="main">
            {!play && <div className="initial">
                <h1 className="initial__title">Quizzical</h1>
                <p className="initial__text">I fun way of learn</p>
                <button className="initial__button" onClick={() => {setPlay(!play)}}>Start Quiz</button>
            </div>}
            {play && questions.map((item, index) => {
                return(
                    <div className="questions" key={item.id}>
                        <h1 className="questions__title"> { item.question } </h1>
                        <div className="questions__options" id={index}>
                            {options[index].map((item) => {
                                return(<p style={item.isChecked ? {backgroundColor: "#94D7A2"} : item.isDoubleChecked ? {backgroundColor: "#F8BCBC"} : {backgroundColor: ""}} className={item.isSelected ? "questions__option selected" : "questions__option"} onClick={handleSelection} key={item.item}> {item.item} </p>)
                            })}
                        </div>
                    </div>
                )
            })}
            {check && <p className="correct-answers">Respostas corretas: {correct} </p>}
            {play && <button className="questions__button" onClick={handleCheck}>Check Answers</button>}
            {check && <button className="restart-button" onClick={() => {
                window.location.reload();
            }}>Recomeçar</button>}
        </main>
    )
}