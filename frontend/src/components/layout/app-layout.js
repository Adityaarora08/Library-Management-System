import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Avatar,
    Button,
    Tooltip,
    MenuItem,
} from "@mui/material"
import { useUser } from "../../context/user-context"
import { Route, Routes, Navigate, Link } from "react-router-dom"
import AdbIcon from "@mui/icons-material/Adb"
import { BooksList } from "../books-list/books-list"
import { LoginDialog } from "../login/login-dialog"
import { SigninDialog } from "../login/signin-dialog"
import { BookForm } from "../book-form/book-form"
import { Book } from "../book/book"
import { WithLoginProtector } from "../access-control/login-protector"
import { WithAdminProtector } from "../access-control/admin-protector"


export const AppLayout = () => {

    const [openLoginDialog, setOpenLoginDialog] = useState(false)
    const [openSignInDialog, setOpenSignInDialog] = useState(false)
    const [anchorElUser, setAnchorElUser] = useState(null)
    const { user, loginUser,signInUser, logoutUser, isAdmin } = useUser()
    const navigate = useNavigate()

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget)
    }

    const handleCloseUserMenu = () => {
        setAnchorElUser(null)
    }

    const handleLoginSubmit = (username, password) => {
        loginUser(username, password)
        setOpenLoginDialog(false)
    }
    const handleSignInSubmit = (data) => {
        signInUser(data)
        setOpenSignInDialog(false)
    }

    const handleLoginClose = () => {
        setOpenLoginDialog(false)
    }
    const handleSignInClose = () => {
        setOpenSignInDialog(false)
    }
    const handleLogout = () => {
        logoutUser()
        handleCloseUserMenu()
    }

    useEffect(() => {
        if (!user) {
            navigate("/")
        } else if (isAdmin) {
            navigate("/admin/books/add")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isAdmin])

    return (
        <>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <AdbIcon sx={{ display: "flex", mr: 1 }} />
                        <Link to="/" style={{ textDecoration: "none", flexGrow: 1 }}>
                            <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    mr: 2,
                                    display: "flex",
                                    fontFamily: "monospace",
                                    fontWeight: 700,
                                    letterSpacing: ".3rem",
                                    color: "white",
                                }}
                            >
                                Library Management System
                            </Typography>
                        </Link>
                        <Box
                            sx={{
                                flexGrow: 0,
                            }}
                        >
                            {user ? (
                                <>
                                    <Tooltip title="Open settings">
                                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                            <Avatar> {user.username.charAt(0).toUpperCase()} </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        sx={{ mt: "45px" }}
                                        id="menu-appbar"
                                        anchorEl={anchorElUser}
                                        anchorOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                        }}
                                        open={Boolean(anchorElUser)}
                                        onClose={handleCloseUserMenu}
                                    >
                                        <MenuItem onClick={handleLogout}>
                                            <Typography textAlign="center">Logout</Typography>
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <div>
                                <Button
                                    onClick={() => {
                                        setOpenLoginDialog(true)
                                    }}
                                    sx={{ my: 2, color: "white", display: "block" }}
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={() => {
                                        setOpenSignInDialog(true)
                                    }}
                                    sx={{ my: 2, color: "white", display: "block" }}
                                >
                                    Sign-Up
                                </Button>
                                </div>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <Routes>
                <Route path="/books" exact element={<BooksList />} />
                <Route
                    path="/books/:bookIsbn"
                    element={
                        <WithLoginProtector>
                            <Book />
                        </WithLoginProtector>
                    }
                />
                <Route
                    path="/admin/books/add"
                    element={
                        <WithLoginProtector>
                            <WithAdminProtector>
                                <BookForm />
                            </WithAdminProtector>
                        </WithLoginProtector>
                    }
                    exact
                />
                <Route
                    path="/admin/books/:bookIsbn/edit"
                    element={
                        <WithLoginProtector>
                            <WithAdminProtector>
                                <BookForm />
                            </WithAdminProtector>
                        </WithLoginProtector>
                    }
                />
                <Route path="*" element={<Navigate to="/books" replace />} />
            </Routes>
            <LoginDialog
                open={openLoginDialog}
                handleSubmit={handleLoginSubmit}
                handleClose={handleLoginClose}
            />
            <SigninDialog
                open={openSignInDialog}
                handleSubmit={handleSignInSubmit}
                handleClose={handleSignInClose}
            />
        </>
    )
}