import {PostType} from "../../types";

export type PropsType = {
    posts: Array<PostType>
    loading: boolean
    loadMore: () => void
}