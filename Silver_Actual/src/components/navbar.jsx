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
  Paper,
  useTheme,
  useMediaQuery,
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

// Read user from localStorage
function getAuthUser() {
  try {
    const raw = localStorage.getItem('app_auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null; // { name, email, picture }
  } catch {
    return null;
  }
}

export default function ResponsiveAppBar() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // ✅ detect desktop vs mobile
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState(() => getAuthUser());
  const scrollYRef = React.useRef(0);

  const toggleMobileMenu = () => setMobileOpen((s) => !s);

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

  // Scroll-lock / preserve position (only when menu open)
  React.useEffect(() => {
    if (mobileOpen) {
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
    } else {
      const saved = scrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      window.scrollTo(0, saved);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
    };
  }, [mobileOpen]);

  const firstName = user?.name ? user.name.split(' ')[0] : null;
  const greeting = user ? `Welcome ${firstName}` : 'Welcome User';

  const avatarSrc = user?.picture || '';
  const showDefaultIcon = !avatarSrc;
  const appBarHeight = 64;

  return (
    <>
      <AppBar
        position={isDesktop ? 'sticky' : 'fixed'} // ✅ Sticky on desktop, Fixed on mobile
        sx={{
          backgroundColor: 'rgba(0,0,0,1)',
          boxShadow: 'none',
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: appBarHeight }}>
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
                    fontFamily:
                      'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
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
                    fontFamily:
                      'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
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
                zIndex: theme.zIndex.appBar + 10,
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
                      fontFamily:
                        'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
                      fontWeight: location.pathname === page.path ? 700 : 500,
                      borderBottom:
                        location.pathname === page.path
                          ? '2px solid #ff6b6b'
                          : 'none',
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
              aria-expanded={mobileOpen}
              aria-label="open mobile menu"
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu (unchanged design, sits below AppBar) */}
      <Paper
        elevation={0}
        square
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0,
          height: '310px',
          zIndex: theme.zIndex.appBar - 1,
          backgroundColor: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(8px)',
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          alignItems: 'center',
          px: 2,
          pt: `${appBarHeight}px`,
          pb: 4,
          gap: 2,
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-6%)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition:
            'transform 280ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease',
          overflowY: 'auto',
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
                fontFamily:
                  'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
                fontWeight: location.pathname === page.path ? 700 : 500,
                borderBottom:
                  location.pathname === page.path
                    ? '2px solid #ff6b6b'
                    : 'none',
                borderRadius: 0,
                py: 1.2,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
              }}
            >
              {page.name}
            </Button>
          </Link>
        ))}
      </Paper>
    </>
  );
}
