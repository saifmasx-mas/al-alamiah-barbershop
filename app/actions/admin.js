'use server';

import { createClient } from '@supabase/supabase-js';

function createUserClient(accessToken) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !accessToken) return null;

  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function authorizeAdmin(accessToken) {
  const userClient = createUserClient(accessToken);
  const adminClient = createAdminClient();
  if (!userClient || !adminClient) {
    return { error: 'Supabase admin configuration is missing.' };
  }

  const { data: authData, error: authError } = await userClient.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return { error: 'Your session is invalid. Sign in again.' };
  }

  const { data: role, error: roleError } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', authData.user.id)
    .maybeSingle();

  if (roleError) return { error: roleError.message };
  if (role?.role !== 'admin') return { error: 'Super admin access is required.' };
  return { adminClient };
}

export async function onboardBarber(formValues, accessToken) {
  const { adminClient, error: authorizationError } = await authorizeAdmin(accessToken);
  if (authorizationError) {
    return { success: false, error: authorizationError };
  }

  const fullName = typeof formValues?.fullName === 'string' ? formValues.fullName.trim() : '';
  const email = typeof formValues?.email === 'string' ? formValues.email.trim().toLowerCase() : '';
  const phone = typeof formValues?.phone === 'string' ? formValues.phone.trim() : '';
  const address = typeof formValues?.address === 'string' ? formValues.address.trim() : '';
  const mapUrl = typeof formValues?.mapUrl === 'string' ? formValues.mapUrl.trim() : '';
  const bufferMinutes = Number(formValues?.bufferMinutes ?? 10);

  if (!fullName || fullName.length > 150 || !email || email.length > 254 || !Number.isInteger(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 180) {
    return { success: false, error: 'Enter a name, valid email, and buffer between 0 and 180 minutes.' };
  }

  if (mapUrl) {
    try {
      const parsedMapUrl = new URL(mapUrl);
      if (!['http:', 'https:'].includes(parsedMapUrl.protocol)) throw new Error('Invalid map URL');
    } catch {
      return { success: false, error: 'The map URL must start with http:// or https://.' };
    }
  }

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { account_type: 'barber', full_name: fullName },
  });
  if (inviteError) return { success: false, error: inviteError.message };
  if (!inviteData.user) {
    return { success: false, error: 'Supabase did not return the invited barber account.' };
  }

  const invitedUserId = inviteData.user.id;
  const { data: barber, error: barberError } = await adminClient
    .from('barbers')
    .insert({
      auth_user_id: invitedUserId,
      name: fullName,
      phone: phone || null,
      address: address || null,
      map_url: mapUrl || null,
      buffer_minutes: bufferMinutes,
    })
    .select('id, name, phone, address, map_url, buffer_minutes, auth_user_id')
    .single();

  if (barberError) {
    const { error: cleanupError } = await adminClient.auth.admin.deleteUser(invitedUserId);
    return {
      success: false,
      error: cleanupError
        ? `${barberError.message} The invited account also could not be removed: ${cleanupError.message}`
        : barberError.message,
    };
  }

  const { error: roleError } = await adminClient
    .from('user_roles')
    .upsert({ user_id: invitedUserId, role: 'barber' }, { onConflict: 'user_id' });

  if (roleError) {
    const { error: profileCleanupError } = await adminClient.from('barbers').delete().eq('id', barber.id);
    const { error: userCleanupError } = await adminClient.auth.admin.deleteUser(invitedUserId);
    const cleanupErrors = [profileCleanupError, userCleanupError].filter(Boolean).map((error) => error.message);
    return {
      success: false,
      error: [roleError.message, ...cleanupErrors].join(' Cleanup also failed: '),
    };
  }

  return { success: true, barber };
}
