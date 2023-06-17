import { useState, useEffect,forwardRef } from "react"
import { Link as RouterLink } from "react-router-dom"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Modal,
    Card,
    CardContent,
    CardActions,
    Typography,
    TablePagination,
    FormControl,InputLabel,Select,MenuItem,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide,
} from "@mui/material"
import { BackendApi } from "../../client/backend-api"
import { useUser } from "../../context/user-context"
import classes from "./styles.module.css"
import Spinner from "../loading/spinner"
import {BsMic,BsFillMicFill, BsFillMicMuteFill} from 'react-icons/bs'
import {GrClose} from 'react-icons/gr'
import {IoMdSearch} from 'react-icons/io'
import {MdMoveUp} from 'react-icons/md'
export const BooksList = () => {

    const [books, setBooks] = useState([]);
    const [borrowedBook, setBorrowedBook] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [activeBookIsbn, setActiveBookIsbn] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const { isAdmin, user } = useUser();
    const [loading, setLoading] = useState(false);
    const [borrowed,setBorrowed]= useState(false);
    const [value, setValue] = useState("");
    const [isbnn, setIsbn] = useState('');
    const [filters,setFilters] = useState(2);
    const [mic,setMic] = useState(false);
    const {
        transcript,
        listening,
      } = useSpeechRecognition();
    const Transition = forwardRef(function Transition(props, ref) {
        return <Slide direction="up" ref={ref} {...props} />
    })
    const onChange = (event) => {
        setValue(event.target.value);
    };

    const onSearch = (searchTerm) => {
        setValue(searchTerm);
    };
    const fetchBooks = async () => {
        const { books } = await BackendApi.book.getAllBooks()
        setBooks(books)
    }

    const fetchUserBook = async () => {
        const { books } = await BackendApi.user.getBorrowBook()
        setBorrowedBook(books)
    }

    const deleteBook = () => {
        if (activeBookIsbn && books.length) {
            BackendApi.book.deleteBook(activeBookIsbn).then(({ success }) => {
                fetchBooks().catch(console.error)
                setOpenModal(false)
                setActiveBookIsbn("")
            })
        }
    }
    const handleMic = () =>{
        if(mic){
            setMic(false);
            SpeechRecognition.stopListening();
            onSearch(transcript);
        }else{
            setMic(true);
            SpeechRecognition.startListening();
        }
    }
    const handleSortChange = (event) => {
        setFilters(event.target.value);
    }
    const handleClose = () => {
        setBorrowed(false);
    }
    const handleEnterKeyDown = () => {
        setBorrowed(false);
    }
    useEffect(() => {
        setLoading(true);
        fetchBooks().catch(console.error)
        fetchUserBook().catch(console.error)
        setTimeout(function() {
            setLoading(false);
          }, 2500);
        
    }, [user])

    return (
        loading ? < Spinner msg = "Loading booklist" / > :
        <>
            <div className={`${classes.pageHeader} ${classes.mb2}`}>
                <Typography variant="h5" fontWeight={900}>Book List</Typography>
                <div className={classes.searchcontainer} style={{position: "relative" }}>
                    <div className={classes.searchinner}>
                    <input type="text" value={value} onChange={onChange} placeholder="Type/say to search books"/>
                    <button onClick={handleMic} className={classes.btnMic}>
                    {!mic?(
                        <BsFillMicMuteFill className={classes.micIcon}/>
                    ):
                    // listening ?
                    //         (
                                <BsFillMicFill className={classes.micIcon}/>
                    //         ) : (
                                // <BsMic className={classes.micIcon}/>
                                // )
                        }
                     <div style={{color: "transparent", position: "absolute"}}>
                        {listening? setTimeout(function(){onSearch(transcript);},50): null}
                    </div>
                    </button>
                    <RouterLink 
                        className={classes.searchbtn}
                        style={{ textDecoration: 'none',margin: "auto" }}
                        to={`/books/${isbnn}`}
                      > <IoMdSearch style={{display:"inline",position:"relative"}}/>Search </RouterLink>
                    </div>
                    <div className={classes.dropdown}>
                    {value.length>0 && books
                        .filter((item) => {
                        const searchTerm = value.toLowerCase();
                        const fullName = item.name.toLowerCase();

                        return (
                            searchTerm &&
                            fullName.startsWith(searchTerm) 
                        );
                        })
                        .slice(0, 10)
                        .map((item) => (
                        <div
                            onClick={() => {
                                setIsbn(item.isbn);
                                onSearch(item.name);
                            }}
                            className={classes.dropdownrow}
                            key={item.name}
                        >
                         <MdMoveUp/> {item.name}  <i>-{item.authorName}</i>
                        </div>
                        ))}
                    </div>
                </div>
                <div>
                <FormControl sx={{position:"relative", marginRight: "10px"}}>
                <InputLabel id="demo-simple-select-label">Sort by :</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={filters}
                    label="Sort by"
                    onChange={handleSortChange}
                >
                    <MenuItem value={0}>Date added</MenuItem>
                    <MenuItem value={2}>Recent to Old</MenuItem>
                    <MenuItem value={1}>Old to Recent</MenuItem>
                </Select>
                </FormControl>
                {isAdmin && (
                    <Button variant="contained" color="primary" component={RouterLink} to="/admin/books/add" sx={{marginTop: "10px"}}>
                        Add Book
                    </Button>
                )}
                {isAdmin===false && borrowed===false && (
                    <Button variant="contained" color="primary" sx={{marginTop: "10px"}} onClick={(e) => {
                        setBorrowed(true);
                    }}>
                    Borrowed books
                   </Button>
                )}
                {!isAdmin && borrowed && (
                    <Button variant="contained" color="primary" sx={{marginTop: "10px"}} onClick={()=>{setBorrowed(false)}}>
                    Click anywhere to close
                   </Button>
                )}
            </div>
            </div>
            {books.length > 0 ? (
                <>
                    <div className={classes.tableContainer}>
                        <TableContainer component={Paper}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Author Name</TableCell>
                                        <TableCell align="right">Year</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell align="right">Available</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                { filters===0 && (rowsPerPage > 0
                                        ? books.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : books
                                    )
                                    .map((book) => (
                                        <TableRow key={book.isbn}>
                                            <TableCell component="th" scope="row">
                                                {book.name}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {book.authorName}
                                            </TableCell>
                                            <TableCell align="right">{book.isbn}</TableCell>
                                            <TableCell>{book.category}</TableCell>
                                            <TableCell align="right">{book.quantity}</TableCell>
                                            <TableCell align="right">{book.availableQuantity}</TableCell>
                                            <TableCell align="right">{`$${book.price}`}</TableCell>
                                            <TableCell>
                                                <div className={classes.actionsContainer}>
                                                    <Button
                                                        variant="contained"
                                                        component={RouterLink}
                                                        size="small"
                                                        to={`/books/${book.isbn}`}
                                                    >
                                                        View
                                                    </Button>
                                                    {isAdmin && (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                component={RouterLink}
                                                                size="small"
                                                                to={`/admin/books/${book.isbn}/edit`}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                size="small"
                                                                onClick={(e) => {
                                                                    setActiveBookIsbn(book.isbn)
                                                                    setOpenModal(true)
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    { filters===1 && (rowsPerPage > 0
                                        ? books.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : books
                                    )
                                    .sort(function(a, b) {
                                        var c = new Date(a.isbn);
                                        var d = new Date(b.isbn);
                                        return c-d;
                                    })
                                    .map((book) => (
                                        <TableRow key={book.isbn}>
                                            <TableCell component="th" scope="row">
                                                {book.name}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {book.authorName}
                                            </TableCell>
                                            <TableCell align="right">{book.isbn}</TableCell>
                                            <TableCell>{book.category}</TableCell>
                                            <TableCell align="right">{book.quantity}</TableCell>
                                            <TableCell align="right">{book.availableQuantity}</TableCell>
                                            <TableCell align="right">{`$${book.price}`}</TableCell>
                                            <TableCell>
                                                <div className={classes.actionsContainer}>
                                                    <Button
                                                        variant="contained"
                                                        component={RouterLink}
                                                        size="small"
                                                        to={`/books/${book.isbn}`}
                                                    >
                                                        View
                                                    </Button>
                                                    {isAdmin && (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                component={RouterLink}
                                                                size="small"
                                                                to={`/admin/books/${book.isbn}/edit`}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                size="small"
                                                                onClick={(e) => {
                                                                    setActiveBookIsbn(book.isbn)
                                                                    setOpenModal(true)
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    { filters===2 && (rowsPerPage > 0
                                        ? books.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : books
                                    )
                                    .sort(function(a, b) {
                                        var c = new Date(a.isbn);
                                        var d = new Date(b.isbn);
                                        return d-c;
                                    })
                                    .map((book) => (
                                        <TableRow key={book.isbn}>
                                            <TableCell component="th" scope="row">
                                                {book.name}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {book.authorName}
                                            </TableCell>
                                            <TableCell align="right">{book.isbn}</TableCell>
                                            <TableCell>{book.category}</TableCell>
                                            <TableCell align="right">{book.quantity}</TableCell>
                                            <TableCell align="right">{book.availableQuantity}</TableCell>
                                            <TableCell align="right">{`$${book.price}`}</TableCell>
                                            <TableCell>
                                                <div className={classes.actionsContainer}>
                                                    <Button
                                                        variant="contained"
                                                        component={RouterLink}
                                                        size="small"
                                                        to={`/books/${book.isbn}`}
                                                    >
                                                        View
                                                    </Button>
                                                    {isAdmin && (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                component={RouterLink}
                                                                size="small"
                                                                to={`/admin/books/${book.isbn}/edit`}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                size="small"
                                                                onClick={(e) => {
                                                                    setActiveBookIsbn(book.isbn)
                                                                    setOpenModal(true)
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10))
                                setPage(0)
                            }}
                            component="div"
                            count={books.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                        />
                        <Modal open={openModal} onClose={(e) => setOpenModal(false)}>
                            <Card className={classes.conf_modal}>
                                <CardContent>
                                    <h2>Are you sure?</h2>
                                </CardContent>
                                <CardActions className={classes.conf_modal_actions}>
                                    <Button variant="contained" onClick={() => setOpenModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="contained" color="secondary" onClick={deleteBook}>
                                        Delete
                                    </Button>
                                </CardActions>
                            </Card>
                        </Modal>
                    </div>
                </>
            ) : (
                <Typography variant="h5">No books found!</Typography>
            )}

            {
                user && !isAdmin && borrowed && (
                    <Dialog
                    open={borrowed}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={handleClose}
                    onKeyDown={handleEnterKeyDown}
                >
                        <div className={`${classes.pageHeader} ${classes.mb2}`}>
                            <Typography variant="h5" fontWeight={900} padding={2}>Borrowed Books</Typography>
                            <Button onClick={handleClose}><GrClose/></Button>
                        </div>
                        {borrowedBook.length > 0 ? (
                            <>
                                <div className={classes.tableContainer} sx={{padding: "20px"}}>
                                    <TableContainer component={Paper} sx={{padding: "10px"}} >
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell align="right">ISBN</TableCell>
                                                    <TableCell>Category</TableCell>
                                                    <TableCell align="right">Price</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {borrowedBook.map((book) => (
                                                    <TableRow key={book.isbn}>
                                                        <TableCell component="th" scope="row">
                                                            {book.name}
                                                        </TableCell>
                                                        <TableCell align="right">{book.isbn}</TableCell>
                                                        <TableCell>{book.category}</TableCell>
                                                        <TableCell align="right">{`$${book.price}`}</TableCell>
                                                        <TableCell>
                                                            <div className={classes.actionsContainer}>
                                                                <Button
                                                                    variant="contained"
                                                                    component={RouterLink}
                                                                    size="small"
                                                                    to={`/books/${book.isbn}`}
                                                                >
                                                                    View
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            </>
                        ) : (
                            <Typography variant="h5">No books issued!</Typography>
                        )}
                    </Dialog>
                )
            }
        </>
    )
}