import React, { useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { ProjectView } from '../components/ProjectView';
import { useStore } from '../store';

const ProjectPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentProject, loadProjectData } = useStore();

    useEffect(() => {
        if (id && (!currentProject || currentProject.id !== id)) {
            loadProjectData(id);
        }
    }, [id, loadProjectData, currentProject]);

    return (
        <ProjectView>
            <Outlet />
        </ProjectView>
    );
};

export default ProjectPage;
