import React from 'react'
import {Card , CardHeader , CardContent , Typography} from '@material-ui/core';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import useStyles from './styles';
import useTransactions from '../../useTransaction'

ChartJS.register(ArcElement, Tooltip, Legend);

const Details = ({title}) => {
    const classes = useStyles();
    const { filteredCategories ,total , chartData } = useTransactions(title);
console.log(chartData);
console.log(filteredCategories);

  return (
    <Card className={title==="Income" ? classes.income: classes.expense}>
        <CardHeader title={title}/>
        <CardContent>
            <Typography variant='h5'>${total}</Typography>
            <Doughnut data={chartData}/>
        </CardContent>
    </Card>
  )
}

export default Details