import * as React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Avatar,
  IconButton,
  Collapse,
  Paper,
} from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import { Link, useLocation } from 'react-router-dom';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Memories', path: '/memories' },
  { name: 'EventFlow', path: '/eventflow' },
  { name: 'Registration', path: '/register' },
];

// read user from localStorage
function getAuthUser() {
  try {
    const raw = localStorage.getItem('app_auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null; // { name, email, picture }
  } catch {
    return null;
  }
}

function ResponsiveAppBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState(() => getAuthUser());

  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'app_auth') setUser(getAuthUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  React.useEffect(() => {
    setUser(getAuthUser());
  }, [location.pathname]);

  const firstName = user?.name ? user.name.split(' ')[0] : null;
  const greeting = user ? `Welcome ${firstName}` : 'Welcome User';

  // avatar logic
  const avatarSrc = user?.picture || '';
  const showDefaultIcon = !avatarSrc;

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: 'rgba(0,0,0,1)', boxShadow: 'none', zIndex: 1201 }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Left: Greeting + avatar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar
                src={showDefaultIcon ? undefined : avatarSrc}
                imgProps={{ referrerPolicy: 'no-referrer' }}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: showDefaultIcon ? 'transparent' : 'grey.800',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {showDefaultIcon && (
                  <AccountCircleRoundedIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.85)' }} />
                )}
              </Avatar>

              <Box sx={{ lineHeight: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    color: '#f1f1f1',
                    letterSpacing: '0.2px',
                  }}
                >
                  {greeting}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
                    fontWeight: 500,
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {user ? 'You are signed in' : 'Please sign in to register'}
                </Typography>
              </Box>
            </Box>

            {/* Center Circle Logo (Desktop only) */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%) translateY(25%)',
                backgroundColor: 'black',
                borderRadius: '50%',
                width: 80,
                height: 80,
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
              }}
            >
              <Avatar
                src="/assets/ARCNavBarLogo.png"
                sx={{
                  width: 80,
                  height: 80,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              />
            </Box>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {pages.map((page) => (
                <Link key={page.name} to={page.path} style={{ textDecoration: 'none' }}>
                  <Button
                    sx={{
                      color: 'white',
                      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
                      fontWeight: location.pathname === page.path ? 700 : 500,
                      borderBottom:
                        location.pathname === page.path ? '2px solid #ff6b6b' : 'none',
                      borderRadius: 0,
                      px: 1,
                      '&:hover': { borderBottom: '2px solid #ff6b6b' },
                    }}
                  >
                    {page.name}
                  </Button>
                </Link>
              ))}
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton
              onClick={toggleMobileMenu}
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Dropdown Menu */}
      <Collapse in={mobileOpen} timeout={300} sx={{ transition: 'height 300ms ease-in-out' }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            zIndex: 1200,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(8px)',
            pt: 2,
            pb: 4,
            px: 2,
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            position: 'relative',
            top: 0,
          }}
        >
          {pages.map((page) => (
            <Link
              key={page.name}
              to={page.path}
              style={{ textDecoration: 'none', width: '100%' }}
              onClick={() => setMobileOpen(false)}
            >
              <Button
                fullWidth
                sx={{
                  color: 'white',
                  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
                  fontWeight: location.pathname === page.path ? 700 : 500,
                  borderBottom:
                    location.pathname === page.path ? '2px solid #ff6b6b' : 'none',
                  borderRadius: 0,
                  py: 1.2,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {page.name}
              </Button>
            </Link>
          ))}
        </Paper>
      </Collapse>
    </>
  );
}

export default ResponsiveAppBar;
  