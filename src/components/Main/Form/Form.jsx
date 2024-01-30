import React , {useState , useContext , useEffect} from 'react'
import { TextField , Typography , Grid , Button , FormControl , InputLabel , Select , MenuItem } from '@material-ui/core'
import useStyles from './styles'
import { ExpenseTrackerContext } from '../../../context/context'
import { v4 as uuidv4 } from 'uuid'
import { incomeCategories , expenseCategories } from '../../../constants/categories'
import formatDate from '../../../utils/formatDate';
import { useSpeechContext } from '@speechly/react-client'
import CustomizedSnackBar from '../../SnackBar/SnackBar'

const initialState = {
    amount: '',
    category: '',
    type: 'Income',
    date: formatDate(new Date()),
}

const Form = () => {
    const classes = useStyles();
    const [formdata, setformdata] = useState(initialState);
    const [open, setOpen] = useState(false);
    const {addTransaction} = useContext(ExpenseTrackerContext);
    const {segment} = useSpeechContext();

    const createTransaction = ()=>{
        if (Number.isNaN(Number(formdata.amount)) || !formdata.date.includes('-')) return;
        const transaction = {...formdata , amount: Number(formdata.amount) , id: uuidv4()};
        setOpen(true)
        addTransaction(transaction);
        setformdata(initialState);
    }

    useEffect(() => {
        if(segment){
        console.log("Segment is there ");
        console.log(segment.words);
        console.log(segment.intent.intent);
            if(segment.intent.intent === 'add_expense'){
                setformdata({ ...formdata,  type:'Expense'});
            }
            else if(segment.intent.intent === 'add_income'){
                setformdata({...formdata , type: 'Income'})
            }
            else if(segment.isFinal && segment.intent.intent === "create_transaction"){
                return createTransaction()
            }
            else if(segment.isFinal && segment.intent.intent === "cancel_transaction"){
                return setformdata(initialState);
            }

            segment.entities.forEach((e)=>{
                const category = `${e.value.charAt(0)}${e.value.slice(1).toLowerCase()}`
                switch (e.type){
                    case 'amount':
                        setformdata({...formdata , amount: e.value});
                        break;
                    case 'category':
                        if (incomeCategories.map((iC) => iC.type).includes(category)) {
                            setformdata({ ...formdata, type: 'Income', category });
                          } else if (expenseCategories.map((iC) => iC.type).includes(category)) {
                            setformdata({ ...formdata, type: 'Expense', category });
                          }
                        break;
                    case 'date':
                        setformdata({...formdata , date: e.value});
                        break;
                    default:
                        break;
                }
            });
            
      if (segment.isFinal && formdata.amount && formdata.category && formdata.type && formdata.date) {
        createTransaction();
      }
        }
    }, [segment])
    

    const selectedCtegories = formdata.type === 'Income' ? incomeCategories : expenseCategories;

  return (
   <Grid container spacing={2}>
    <CustomizedSnackBar open={open}  setOpen={setOpen}/>
    <Grid item xs={12}>
        <Typography align='center' variant='subtitle2' gutterBottom>
            {segment && segment.words.map((w) => w.value).join(" ")}
        </Typography>
    </Grid>
    <Grid item xs={6}>
        <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={formdata.type} onChange={(e) => setformdata( {...formdata , type: e.target.value})}>
                <MenuItem value="Income">Income</MenuItem>
                <MenuItem value="Expense">Expense</MenuItem>
            </Select>
        </FormControl>
    </Grid>
    <Grid item xs={6}>
        <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={formdata.category} onChange={(e) => setformdata({...formdata , category: e.target.value})}>
                {selectedCtegories.map((c)=> <MenuItem key={c.type} value={c.type}>{c.type}</MenuItem>)}
            </Select>
        </FormControl>
    </Grid>
    <Grid item xs={6}>
        <TextField type='number' label="Amount" fullWidth value={formdata.amount} onChange={(e) => setformdata({...formdata , amount: e.target.value})}/>
    </Grid>
    <Grid item xs={6}>
        <TextField type='date' label="Date" fullWidth value={formdata.date} onChange={(e) => setformdata({...formdata , date: formatDate(e.target.value)})}/>
    </Grid>
    <Button className={classes.button} variant='outlined' color='primary' fullWidth onClick={createTransaction}>Create</Button>
   </Grid>
  )
}

export default Form