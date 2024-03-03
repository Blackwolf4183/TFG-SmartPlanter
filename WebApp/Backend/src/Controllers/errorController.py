from ..database import create_supabase_client

from fastapi import Depends, HTTPException, status

#Initialize supabase client
supabase = create_supabase_client()

async def get_latest_errors(device_id, user):

    #Check if device exists
    device = supabase.from_("device").select("*").eq("id", device_id).execute()
    if len(device.data) == 0:
        raise HTTPException(status_code=404, detail="Device not found")
    
    print("AQUI LLEGA")

    #Ceck if device belongs to user
    user_device = supabase.from_("userdevice").select("*").eq("id", device_id).eq("userid", user.id).execute()
    if len(user_device.data) == 0:
        raise HTTPException(status_code=401, detail="User doesn't have access to device")

    errors = supabase.from_("errorlog")\
            .select("*")\
            .eq("source", device_id)\
            .order("errortime", desc=True)\
            .limit(10)\
            .execute()

    error_data = errors.data

    return error_data