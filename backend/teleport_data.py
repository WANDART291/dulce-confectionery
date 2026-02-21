import psycopg2

# 1. YOUR LOCAL DATABASE (THE SOURCE)
LOCAL_DB = "postgresql://postgres:password123@localhost:5432/dulce_db"

# 2. YOUR NEON DATABASE (THE DESTINATION)
CLOUD_DB = "postgresql://neondb_owner:npg_lQrIKmVA6o9O@ep-small-dawn-aid2lt76-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

def teleport():
    local_conn = None
    cloud_conn = None
    try:
        # Connect to both
        local_conn = psycopg2.connect(LOCAL_DB)
        cloud_conn = psycopg2.connect(CLOUD_DB)
        
        local_cur = local_conn.cursor()
        cloud_cur = cloud_conn.cursor()

        # --- TELEPORT PRODUCTS (CAKES) ---
        print("🍰 Fetching cakes from local...")
        local_cur.execute("SELECT name, price, stock_quantity FROM business_product")
        cakes = local_cur.fetchall()

        for cake in cakes:
            print(f"  -> Sending {cake[0]} to the cloud...")
            cloud_cur.execute(
                "INSERT INTO business_product (name, price, stock_quantity, updated_at) VALUES (%s, %s, %s, NOW())",
                cake
            )

        # --- TELEPORT COURSES (ACADEMY) ---
        print("\n🎓 Fetching courses from local...")
        local_cur.execute("SELECT title, level, date_time, price, seats_available FROM business_course")
        courses = local_cur.fetchall()

        for course in courses:
            print(f"  -> Sending {course[0]} to the cloud...")
            cloud_cur.execute(
                "INSERT INTO business_course (title, level, date_time, price, seats_available) VALUES (%s, %s, %s, %s, %s)",
                course
            )

        cloud_conn.commit()
        print("\n✅ MISSION SUCCESS: All data is now live!")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if local_conn: local_conn.close()
        if cloud_conn: cloud_conn.close()

if __name__ == "__main__":
    teleport()