import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import moment from "moment"
import { uploadProfilePic } from "../../apiCalls/users"
import { showLoader, hideLoader } from "../../redux/loaderSlice"
import toast from "react-hot-toast"
import { setUser } from "../../redux/usersSlice"

const Profile = () =>{
    const { user } = useSelector(state => state.userReducer)
    const [image, setImage] = useState("")
    const dispatch = useDispatch()

    useEffect(()=>{
        if(user?.profilePic){
            setImage(user?.profilePic)
        }
    },[user])

    const getFullName =() =>{
        let fName = user?.firstName.charAt(0).toUpperCase() + user?.firstName.slice(1).toLowerCase()
        let lName = user?.lastName.charAt(0).toUpperCase() + user?.lastName.slice(1).toLowerCase()
        return `${fName} ${lName}`
    }

    const getInitials = () => {
        let f = user?.firstName.toUpperCase()[0]
        let l = user?.lastName.toUpperCase()[0]
        return `${f}${l}`
    }

    const formatTime = (timestamp) =>{
        const today = moment().startOf('day')
        const messageDay = moment(timestamp).startOf('day')
        const diff = today.diff(messageDay, 'days')
  
        if(diff === 0) return `Today, ${moment(timestamp).format('MMM DD, YYYY')}`;
        else if(diff === 1) return `Yesterday, ${moment(timestamp).format('MMM DD, YYYY')}`;
        else return moment(timestamp).format('MMM DD, YYYY');
    }

    const onFileSelect = async(e) =>{
        const file= e.target.files[0]
        const reader = new FileReader(file)

        reader.readAsDataURL(file)

        reader.onloadend = async ()=>{
            setImage(reader.result)
        }
    }

    const updateProfilePic = async()=>{
        try{
            dispatch(showLoader())
            const response = await uploadProfilePic(image)
            dispatch(hideLoader())

            if(response.success){
                toast.success(response.message)
                dispatch(setUser(response.data))
            }else{
                toast.error(response.message)
            }
        }catch(err){
            dispatch(hideLoader())
            toast.error(err.message)
        }
        
    }

    return (
        <div className="profile-page-container">
            <div className="profile-pic-container">
                {image &&
                    <img 
                        src={image}
                        alt="Profile Pic"
                        className="user-profile-pic-upload"
                    />
                }
                {!image &&
                    <div className="user-default-profile-avatar">
                        {getInitials()}
                    </div>
                }
            </div>
            <div className="profile-info-container">
                <div className="user-profile-name">
                    <h1>{getFullName()}</h1>
                </div>
                <div>
                    <b>Email: </b>
                        {user?.email}
                </div>
                <div>
                    <b>Account Created: </b>
                    {formatTime(user?.createdAt)}
                </div>
                <div className="select-profile-pic-container">
                    <input 
                        type="file"
                        onChange={onFileSelect}
                    />
                    <button
                        className="upload-image-btn"
                        onClick={updateProfilePic}
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Profile