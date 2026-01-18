import React, { useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { ProjectView } from '../components/ProjectView';
import { useStore } from '../store';

const ProjectPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentProject, loadProjectInitial } = useStore();

    useEffect(() => {
        if (id && (!currentProject || currentProject.id !== id)) {
            loadProjectInitial(id);
        }
    }, [id, loadProjectInitial, currentProject]);

    return (
        <ProjectView>
            <Outlet />
        </ProjectView>
    );
};

export default ProjectPage;
