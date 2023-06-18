import { SUPABASE } from "./home";

export { default, SUPABASE, getServerSideProps } from './home';

SUPABASE.auth.onAuthStateChange((event, session) => {
    console.log(event);
});
