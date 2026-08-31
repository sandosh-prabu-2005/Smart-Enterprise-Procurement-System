-- The users table currently has plaintext passwords (e.g. "admin123") stored
-- in password_hash instead of real BCrypt hashes, which is why login always
-- fails with "Bad credentials" even with the correct password.
-- This sets proper BCrypt hashes for all 5 seed users.

-- admin       -> admin123
UPDATE public.users SET password_hash = '$2b$10$UUnqpLjVbmiWnLGMKlgvR.vaFlh3G3Kt0suKrxGS7sI66Vf58UJV.' WHERE username = 'admin';

-- manager1    -> manager123
UPDATE public.users SET password_hash = '$2b$10$eCkLbMyGpBTnyL01ZXmRvuj5cCoJcm98kkt5Oe5cwoeqvuPtodpHq' WHERE username = 'manager1';

-- finance1    -> finance123
UPDATE public.users SET password_hash = '$2b$10$Iv4LPG/Wc/ahD5GXsOBKku/bgbcDz.l50JYCaqDADclAoDui1F/nm' WHERE username = 'finance1';

-- requester1  -> requester123
UPDATE public.users SET password_hash = '$2b$10$szb4BYNh3R96eJ99AXXur.4u0VOp9ewN3tn.eGjThKJMMpUiI33Jm' WHERE username = 'requester1';

-- receiver1   -> receiver123
UPDATE public.users SET password_hash = '$2b$10$Bh0HZxJ4nSfD5qi6FHm6QuTZawuWskjPi/8f.dKMN4R/8XAMb4N22' WHERE username = 'receiver1';
