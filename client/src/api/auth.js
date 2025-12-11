const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const addUser = async (email, currentUserEmail, companyId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chats/addUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, currentUserEmail, companyId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to add user to chat");
        }
        return data;
    } catch (error) {
        console.error("Error adding user to chat:", error);
        throw error;
    }
}

export async function login(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        console.log("Login successful:", data);

        // Store user data in localStorage
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export async function register(username, email) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }

        console.log("Registration successful:", data);
        return data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}

export async function getCompanyUsers(companyId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/company/${companyId}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch company users");
        }

        // Return the users array from the response
        return data.users || data;
    } catch (error) {
        console.error("Error fetching company users:", error);
        throw error;
    }
}
